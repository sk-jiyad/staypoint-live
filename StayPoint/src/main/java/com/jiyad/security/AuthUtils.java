package com.jiyad.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

public final class AuthUtils {

    private AuthUtils() {}

    /** The Clerk user id (JWT `sub`) of the authenticated caller. */
    public static String currentUserId() {
        return currentJwt().getSubject();
    }

    /** A friendly display name for reviews, from Clerk JWT claims (falls back to "Resident"). */
    public static String currentUserName() {
        Jwt jwt = currentJwt();
        for (String claim : new String[] {"name", "full_name", "username", "email"}) {
            String v = jwt.getClaimAsString(claim);
            if (v != null && !v.isBlank()) {
                int at = v.indexOf('@');
                return at > 0 ? v.substring(0, at) : v;
            }
        }
        return "Resident";
    }

    private static Jwt currentJwt() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt;
        }
        throw new AccessDeniedException("Not authenticated");
    }
}
