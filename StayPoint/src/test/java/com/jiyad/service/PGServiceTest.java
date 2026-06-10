package com.jiyad.service;

import com.jiyad.dto.PGCreateDTO;
import com.jiyad.dto.PGUpdateDTO;
import com.jiyad.exception.ResourceNotFoundException;
import com.jiyad.model.PG;
import com.jiyad.repository.PGRepository;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PGServiceTest {

    @Mock
    private PGRepository pgRepository;

    @InjectMocks
    private PGService pgService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    /** Authenticate as a Clerk user (JWT principal): sub = userId, role = owner. */
    private void authenticateAs(String userId) {
        Jwt jwt = Jwt.withTokenValue("test-token")
            .header("alg", "none")
            .subject(userId)
            .claim("role", "owner")
            .build();
        JwtAuthenticationToken auth = new JwtAuthenticationToken(
            jwt, List.of(new SimpleGrantedAuthority("ROLE_OWNER")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private PGCreateDTO validCreateDto() {
        PGCreateDTO d = new PGCreateDTO();
        d.setName("Test PG");
        d.setOwnerName("Tester");
        d.setContactNumber("1234567890");
        d.setAddress("123 Some Long Street Name");
        d.setRentSingle(new BigDecimal("5000"));
        d.setRentDouble(new BigDecimal("7000"));
        d.setFoodProvided(true);
        d.setWifiAvailable(true);
        d.setAcAvailable(false);
        return d;
    }

    @Test
    void getPGById_whenExists_returnsPG() {
        PG pg = new PG();
        pg.setId(1L);
        pg.setName("Test PG");
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));

        Optional<PG> result = pgService.getPGById(1L);

        assertTrue(result.isPresent());
        assertEquals("Test PG", result.get().getName());
        verify(pgRepository).findById(1L);
    }

    @Test
    void getPGById_whenNotExists_returnsEmpty() {
        when(pgRepository.findById(99L)).thenReturn(Optional.empty());

        assertTrue(pgService.getPGById(99L).isEmpty());
    }

    @Test
    void createPG_stampsCurrentUserIdAsOwner() {
        authenticateAs("user_42");
        when(pgRepository.save(any(PG.class))).thenAnswer(inv -> inv.getArgument(0));

        pgService.createPG(validCreateDto());

        ArgumentCaptor<PG> captor = ArgumentCaptor.forClass(PG.class);
        verify(pgRepository).save(captor.capture());
        assertEquals("user_42", captor.getValue().getOwnerUserId());
    }

    @Test
    void updatePG_whenNotFound_throwsResourceNotFoundException() {
        when(pgRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> pgService.updatePG(99L, new PGUpdateDTO()));
        verify(pgRepository, never()).save(any());
    }

    @Test
    void updatePG_whenNotOwner_throwsAccessDenied() {
        authenticateAs("user_42");
        PG pg = new PG();
        pg.setId(1L);
        pg.setOwnerUserId("user_99");
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));

        assertThrows(AccessDeniedException.class,
            () -> pgService.updatePG(1L, new PGUpdateDTO()));
        verify(pgRepository, never()).save(any());
    }

    @Test
    void deletePG_whenNotOwner_throwsAccessDenied() {
        authenticateAs("user_42");
        PG pg = new PG();
        pg.setId(1L);
        pg.setOwnerUserId("user_99");
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));

        assertThrows(AccessDeniedException.class, () -> pgService.deletePG(1L));
        verify(pgRepository, never()).delete(any());
    }

    @Test
    void deletePG_whenOwner_deletes() {
        authenticateAs("user_42");
        PG pg = new PG();
        pg.setId(1L);
        pg.setOwnerUserId("user_42");
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));

        pgService.deletePG(1L);

        verify(pgRepository).delete(pg);
    }

    @Test
    void getMyPGs_returnsOnlyCurrentOwnersPGs() {
        authenticateAs("user_42");
        PG mine = new PG();
        mine.setId(1L);
        mine.setOwnerUserId("user_42");
        when(pgRepository.findByOwnerUserId("user_42")).thenReturn(List.of(mine));

        List<PG> result = pgService.getMyPGs();

        assertEquals(1, result.size());
        assertEquals("user_42", result.get(0).getOwnerUserId());
        verify(pgRepository).findByOwnerUserId("user_42");
    }

    @Test
    void createPG_persistsImageUrls() {
        authenticateAs("user_7");
        when(pgRepository.save(any(PG.class))).thenAnswer(inv -> inv.getArgument(0));
        PGCreateDTO dto = validCreateDto();
        dto.setImageUrls(List.of("https://img/a.jpg", "https://img/b.jpg"));

        pgService.createPG(dto);

        ArgumentCaptor<PG> captor = ArgumentCaptor.forClass(PG.class);
        verify(pgRepository).save(captor.capture());
        assertEquals(List.of("https://img/a.jpg", "https://img/b.jpg"), captor.getValue().getImageUrls());
    }

    @Test
    void createPG_persistsGenderAndRooms() {
        authenticateAs("user_7");
        when(pgRepository.save(any(PG.class))).thenAnswer(inv -> inv.getArgument(0));
        PGCreateDTO dto = validCreateDto();
        dto.setGender("girls");
        dto.setTotalRooms(10);
        dto.setAvailableRooms(3);

        pgService.createPG(dto);

        ArgumentCaptor<PG> captor = ArgumentCaptor.forClass(PG.class);
        verify(pgRepository).save(captor.capture());
        assertEquals("girls", captor.getValue().getGender());
        assertEquals(3, captor.getValue().getAvailableRooms());
    }
}
