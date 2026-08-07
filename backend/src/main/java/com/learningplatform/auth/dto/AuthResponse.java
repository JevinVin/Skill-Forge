package com.learningplatform.auth.dto;

import com.learningplatform.auth.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Response body for {@code POST /api/auth/register} and {@code POST /api/auth/login}.
 *
 * <p>Contains the JWT access token alongside the user's profile so the frontend
 * doesn't need a separate call to /me immediately after login.
 */
@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {

    /** Signed JWT the client must include as {@code Authorization: Bearer <token>}. */
    private final String token;

    private final Long id;
    private final String email;
    private final String fullName;

    /** String representation of the user's {@link com.learningplatform.auth.model.Role}. */
    private final String role;

    /**
     * Convenience factory to build an {@link AuthResponse} from a {@link User} entity and token.
     *
     * @param user  the authenticated/registered user
     * @param token the generated JWT
     * @return a populated {@link AuthResponse}
     */
    public static AuthResponse from(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
