package com.learningplatform.shared.config;

import com.learningplatform.auth.config.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * Spring Security filter chain configuration.
 *
 * <p>Responsibilities:
 * <ul>
 *   <li>Disable CSRF (stateless REST API — tokens, not cookies)</li>
 *   <li>Configure CORS to allow the React dev server on port 5173</li>
 *   <li>Set session policy to STATELESS</li>
 *   <li>Register the {@link JwtAuthFilter} before the default auth filter</li>
 *   <li>Define per-path authorization rules by role</li>
 *   <li>Return JSON (not HTML) on 401/403 so the frontend can parse errors</li>
 * </ul>
 *
 * <p>{@link org.springframework.security.crypto.password.PasswordEncoder} and
 * {@link org.springframework.security.authentication.AuthenticationManager} live in
 * {@link AppConfig} to avoid a circular dependency with {@code AuthService}.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    /**
     * Main security filter chain.
     *
     * @param http the {@link HttpSecurity} builder
     * @return the configured {@link SecurityFilterChain}
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))


                // ── Authorization rules ──────────────────────────────────────
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints — no token required
                        .requestMatchers("/api/auth/**", "/api/health", "/uploads/**").permitAll()

                        // AI Assistant Chatbox — any authenticated user
                        .requestMatchers("/api/ai/**").authenticated()



                        // Course reads — any authenticated user (STUDENT or INSTRUCTOR)
                        .requestMatchers(HttpMethod.GET, "/api/courses/**").authenticated()

                        // Lesson completion & Quiz submit — any authenticated user (STUDENT or INSTRUCTOR).
                        // Must be declared BEFORE the broad INSTRUCTOR-only POST rule below.
                        .requestMatchers(HttpMethod.POST, "/api/courses/*/lessons/*/complete").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/courses/*/quiz/submit").authenticated()

                        // Course writes and quiz management — INSTRUCTOR only
                        .requestMatchers(HttpMethod.POST, "/api/courses/**").hasRole("INSTRUCTOR")

                        .requestMatchers(HttpMethod.PUT, "/api/courses/**").hasRole("INSTRUCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/courses/**").hasRole("INSTRUCTOR")

                        // Module operations (lesson additions) — INSTRUCTOR only
                        .requestMatchers("/api/modules/**").hasRole("INSTRUCTOR")

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )

                // Register JWT filter before Spring's default username/password filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                // ── Error responses — return JSON, not the default Spring HTML pages ──
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, ex) -> {
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write(
                                    "{\"error\":\"Authentication required\",\"code\":\"UNAUTHORIZED\"}");
                        })
                        .accessDeniedHandler((request, response, ex) -> {
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.getWriter().write(
                                    "{\"error\":\"Access denied\",\"code\":\"FORBIDDEN\"}");
                        })
                );

        return http.build();
    }

    /**
     * CORS configuration allowing requests from the React dev server.
     * In production, replace the allowed origin with the real frontend domain.
     *
     * @return a {@link CorsConfigurationSource} applied to all paths
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
