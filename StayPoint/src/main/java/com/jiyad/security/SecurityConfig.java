package com.jiyad.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/api/pgs/mine").hasAuthority("ROLE_OWNER")
                .requestMatchers(HttpMethod.GET, "/api/pgs/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/pgs").hasAuthority("ROLE_OWNER")
                .requestMatchers(HttpMethod.PUT, "/api/pgs/**").hasAuthority("ROLE_OWNER")
                .requestMatchers(HttpMethod.DELETE, "/api/pgs/**").hasAuthority("ROLE_OWNER")
                .requestMatchers("/api/uploads/**").hasAuthority("ROLE_OWNER")
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt ->
                jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    /**
     * Clerk puts the user's role ("owner" | "renter") in the session JWT as a `role` claim.
     * Map it to a Spring authority (ROLE_OWNER / ROLE_RENTER) so the rules above enforce it.
     */
    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaimAsString("role");
            if (role == null || role.isBlank()) {
                return List.of();
            }
            return List.<GrantedAuthority>of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
        });
        return converter;
    }
}
