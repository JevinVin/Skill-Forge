package com.learningplatform.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * General application bean configuration.
 *
 * <p>The {@link PasswordEncoder} and {@link AuthenticationManager} beans are defined
 * here (rather than in {@link SecurityConfig}) to break a circular dependency:
 * {@code SecurityConfig → JwtAuthFilter → AuthService → PasswordEncoder ← SecurityConfig}.
 * Placing them in a separate configuration class eliminates that cycle.
 */
@Configuration
public class AppConfig {

    /**
     * BCrypt password encoder used throughout the application for hashing
     * and verifying passwords. Cost factor defaults to 10.
     *
     * @return a {@link BCryptPasswordEncoder} instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Exposes Spring Security's {@link AuthenticationManager} as a bean so it can
     * be injected into service classes that need to programmatically authenticate.
     *
     * @param config Spring's auto-configured {@link AuthenticationConfiguration}
     * @return the application's {@link AuthenticationManager}
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
