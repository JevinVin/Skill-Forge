package com.learningplatform.auth.controller;

import com.learningplatform.auth.dto.AuthResponse;
import com.learningplatform.auth.dto.LoginRequest;
import com.learningplatform.auth.dto.RegisterRequest;
import com.learningplatform.auth.dto.UserResponse;
import com.learningplatform.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * Thin REST controller for authentication endpoints.
 *
 * <p>All business logic lives in {@link AuthService} — this controller only handles
 * request/response mapping and delegates immediately.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Registers a new user account.
     *
     * @param request validated registration payload
     * @return 201 Created with the JWT and user profile
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    /**
     * Authenticates a user and returns a JWT token.
     *
     * @param request validated login credentials
     * @return 200 OK with the JWT and user profile
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Returns the profile of the currently authenticated user.
     *
     * <p>Spring Security populates {@link Principal} from the JWT token via
     * {@code JwtAuthFilter} — {@code principal.getName()} returns the user's email.
     *
     * @param principal injected by Spring Security from the verified JWT
     * @return 200 OK with the user's profile (no token)
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Principal principal) {
        return ResponseEntity.ok(authService.getUserByEmail(principal.getName()));
    }
}
