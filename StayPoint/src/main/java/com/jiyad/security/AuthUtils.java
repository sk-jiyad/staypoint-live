package com.jiyad.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

public final class AuthUtils {

    private AuthUtils() {}

    /** The Clerk user id (JWT `sub`) of the authenticated caller. */
    public static String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        throw new AccessDeniedException("Not authenticated");
    }
}
