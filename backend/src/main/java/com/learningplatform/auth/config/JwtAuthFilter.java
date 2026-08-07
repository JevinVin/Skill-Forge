package com.learningplatform.auth.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Per-request JWT authentication filter.
 *
 * <p>Runs once per HTTP request (via {@link OncePerRequestFilter}). If a valid
 * {@code Authorization: Bearer <token>} header is present, the filter extracts
 * the user's email from the token, loads their {@link UserDetails}, and populates
 * the {@link SecurityContextHolder} — making the request authenticated for the
 * duration of the call.
 *
 * <p>Requests without a Bearer token are passed through unchanged, leaving Spring
 * Security to enforce access rules based on the configured permit/deny patterns.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    /**
     * Injected as {@link UserDetailsService} (not {@code AuthService} directly)
     * to avoid coupling this filter to the auth feature's implementation class.
     * Spring will resolve this to the {@code AuthService} bean at runtime.
     */
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Skip filtering if there is no Bearer token — let Spring decide access
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7); // Strip "Bearer " prefix

        // Only set authentication if the token is valid and the context is empty.
        // Checking for existing auth prevents overwriting an already-authenticated request.
        if (jwtUtil.isTokenValid(token)
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            String email = jwtUtil.extractEmail(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authToken);
            log.debug("JWT authenticated user: {}", email);
        }

        filterChain.doFilter(request, response);
    }
}
