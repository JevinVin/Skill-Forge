package com.learningplatform.auth.service;

import com.learningplatform.auth.config.JwtUtil;
import com.learningplatform.auth.dto.AuthResponse;
import com.learningplatform.auth.dto.LoginRequest;
import com.learningplatform.auth.dto.RegisterRequest;
import com.learningplatform.auth.dto.UserResponse;
import com.learningplatform.auth.model.Role;
import com.learningplatform.auth.model.User;
import com.learningplatform.auth.repository.UserRepository;
import com.learningplatform.shared.exception.ConflictException;
import com.learningplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for user authentication and profile management.
 *
 * <p>Implements {@link UserDetailsService} so Spring Security's {@code JwtAuthFilter}
 * can load a user by email when validating a JWT on each request.
 *
 * <p>Responsibilities:
 * <ul>
 *   <li>Register a new user (hash password, persist, return JWT)</li>
 *   <li>Login (verify credentials, return JWT)</li>
 *   <li>Fetch current user profile by email</li>
 *   <li>Provide {@link UserDetails} to the security framework</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Registers a new user account and returns a JWT on success.
     *
     * <p>The {@code role} field in the request is optional — it defaults to
     * {@link Role#STUDENT} when omitted.
     *
     * @param request registration details (name, email, password, optional role)
     * @return an {@link AuthResponse} containing the JWT and user profile
     * @throws ConflictException if the email is already registered
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                // Default to STUDENT if no role specified in the request
                .role(request.getRole() != null ? request.getRole() : Role.STUDENT)
                .build();

        userRepository.save(user);
        log.info("New user registered: {} ({})", user.getEmail(), user.getRole());

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return AuthResponse.from(user, token);
    }

    /**
     * Authenticates a user by email and password, returning a JWT on success.
     *
     * <p>A generic "Invalid email or password" message is returned for both
     * unknown-email and wrong-password cases to prevent user enumeration.
     *
     * @param request login credentials
     * @return an {@link AuthResponse} containing the JWT and user profile
     * @throws BadCredentialsException if the credentials are incorrect
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        log.info("User logged in: {}", user.getEmail());
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return AuthResponse.from(user, token);
    }

    /**
     * Returns the profile of the user identified by the given email.
     * Used by the {@code GET /api/auth/me} endpoint, which extracts the email
     * from the validated JWT via Spring Security's {@link java.security.Principal}.
     *
     * @param email the authenticated user's email
     * @return a {@link UserResponse} with the user's profile (no token)
     * @throws ResourceNotFoundException if no user exists with that email
     */
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return UserResponse.from(user);
    }

    /**
     * Spring Security hook — loads a {@link UserDetails} object by email.
     *
     * <p>Called by {@code JwtAuthFilter} on every authenticated request to build
     * the security principal. Roles are prefixed with {@code ROLE_} by the
     * {@code .roles()} builder, matching Spring Security's convention.
     *
     * @param email the user's email (used as the Spring Security username)
     * @return a populated {@link UserDetails} instance
     * @throws UsernameNotFoundException if no user has this email
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // .roles() automatically prefixes with "ROLE_" — so STUDENT becomes ROLE_STUDENT
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();
    }
}
