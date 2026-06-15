package com.jiyad.service;

import com.jiyad.dto.ReviewCreateDTO;
import com.jiyad.model.PG;
import com.jiyad.model.Review;
import com.jiyad.repository.PGRepository;
import com.jiyad.repository.ReviewRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private PGRepository pgRepository;
    @InjectMocks private ReviewService reviewService;

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(String userId) {
        Jwt jwt = Jwt.withTokenValue("test-token")
            .header("alg", "none")
            .subject(userId)
            .claim("name", "reviewer-" + userId)
            .build();
        JwtAuthenticationToken auth = new JwtAuthenticationToken(
            jwt, List.of(new SimpleGrantedAuthority("ROLE_RENTER")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private ReviewCreateDTO dto(int rating, String comment) {
        ReviewCreateDTO d = new ReviewCreateDTO();
        d.setRating(rating);
        d.setComment(comment);
        return d;
    }

    @Test
    void ownerCannotReviewOwnPg() {
        authenticateAs("user_owner");
        PG pg = new PG();
        pg.setId(1L);
        pg.setOwnerUserId("user_owner");
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));

        assertThrows(AccessDeniedException.class, () -> reviewService.addOrUpdateReview(1L, dto(5, "great")));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void addReview_savesAndRecomputesAggregates() {
        authenticateAs("user_abc");
        PG pg = new PG();
        pg.setId(1L);
        pg.setOwnerUserId("user_owner");
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));
        when(reviewRepository.findByPgIdAndAuthorUserId(1L, "user_abc")).thenReturn(Optional.empty());
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

        Review r4 = new Review(); r4.setRating(4);
        Review r2 = new Review(); r2.setRating(2);
        when(reviewRepository.findByPgId(1L)).thenReturn(List.of(r4, r2));

        reviewService.addOrUpdateReview(1L, dto(4, "decent"));

        ArgumentCaptor<PG> pgCaptor = ArgumentCaptor.forClass(PG.class);
        verify(pgRepository).save(pgCaptor.capture());
        assertEquals(2, pgCaptor.getValue().getReviewCount());
        assertEquals(3.0, pgCaptor.getValue().getAvgRating());
    }

    @Test
    void addReview_upsertsExistingReview() {
        authenticateAs("user_abc");
        PG pg = new PG();
        pg.setId(1L);
        pg.setOwnerUserId("user_owner");
        Review existing = new Review();
        existing.setId(55L);
        existing.setPgId(1L);
        existing.setAuthorUserId("user_abc");
        existing.setRating(2);
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));
        when(reviewRepository.findByPgIdAndAuthorUserId(1L, "user_abc")).thenReturn(Optional.of(existing));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewRepository.findByPgId(1L)).thenReturn(List.of(existing));

        Review saved = reviewService.addOrUpdateReview(1L, dto(5, "improved"));

        assertEquals(55L, saved.getId());
        assertEquals(5, saved.getRating());
    }
}
