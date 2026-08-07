package com.learningplatform.auth.dto;

import com.learningplatform.auth.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Response body for {@code GET /api/auth/me}.
 *
 * <p>Contains the current user's profile without a token — the caller already
 * has the token; this endpoint just hydrates the session on page refresh.
 */
@Getter
@Builder
@AllArgsConstructor
public class UserResponse {

    private final Long id;
    private final String email;
    private final String fullName;
    private final String role;

    /**
     * Convenience factory to build a {@link UserResponse} from a {@link User} entity.
     *
     * @param user the user entity to convert
     * @return a populated {@link UserResponse}
     */
    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
