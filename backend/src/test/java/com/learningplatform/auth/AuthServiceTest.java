package com.learningplatform.auth;

import com.learningplatform.auth.config.JwtUtil;
import com.learningplatform.auth.dto.AuthResponse;
import com.learningplatform.auth.dto.LoginRequest;
import com.learningplatform.auth.dto.RegisterRequest;
import com.learningplatform.auth.model.Role;
import com.learningplatform.auth.model.User;
import com.learningplatform.auth.repository.UserRepository;
import com.learningplatform.auth.service.AuthService;
import com.learningplatform.shared.exception.ConflictException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link AuthService}.
 *
 * <p>Uses Mockito only — no Spring context, no database. This means tests run
 * instantly without Docker or any external infrastructure.
 *
 * <p>Coverage:
 * <ul>
 *   <li>register: success, duplicate email</li>
 *   <li>login: success, wrong password, unknown user</li>
 * </ul>
 *
 * <p>Not covered: loadUserByUsername (it's a thin repository lookup — tested
 * indirectly by the login and /me integration flows).
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    // ── register ─────────────────────────────────────────────────────────────

    @Test
    void register_withValidRequest_savesUserAndReturnsToken() {
        RegisterRequest request = buildRegisterRequest("alice@example.com", null);

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("alice@example.com");
        // Role defaults to STUDENT when not specified
        assertThat(response.getRole()).isEqualTo("STUDENT");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withExplicitInstructorRole_savesWithThatRole() {
        RegisterRequest request = buildRegisterRequest("bob@example.com", Role.INSTRUCTOR);

        when(userRepository.existsByEmail("bob@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.getRole()).isEqualTo("INSTRUCTOR");
    }

    @Test
    void register_withDuplicateEmail_throwsConflictException() {
        RegisterRequest request = buildRegisterRequest("duplicate@example.com", null);
        when(userRepository.existsByEmail("duplicate@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already in use");
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    void login_withCorrectCredentials_returnsToken() {
        User user = buildUser("carol@example.com", "hashed", Role.STUDENT);
        LoginRequest request = buildLoginRequest("carol@example.com", "password123");

        when(userRepository.findByEmail("carol@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("carol@example.com");
    }

    @Test
    void login_withWrongPassword_throwsBadCredentialsException() {
        User user = buildUser("dave@example.com", "hashed", Role.STUDENT);
        LoginRequest request = buildLoginRequest("dave@example.com", "wrongpassword");

        when(userRepository.findByEmail("dave@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void login_withUnknownEmail_throwsBadCredentialsException() {
        LoginRequest request = buildLoginRequest("nobody@example.com", "password123");
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private RegisterRequest buildRegisterRequest(String email, Role role) {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Test User");
        req.setEmail(email);
        req.setPassword("password123");
        req.setRole(role);
        return req;
    }

    private LoginRequest buildLoginRequest(String email, String password) {
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword(password);
        return req;
    }

    private User buildUser(String email, String passwordHash, Role role) {
        return User.builder()
                .id(1L)
                .fullName("Test User")
                .email(email)
                .passwordHash(passwordHash)
                .role(role)
                .build();
    }
}
