package com.learningplatform.auth.dto;

import com.learningplatform.auth.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for {@code POST /api/auth/register}.
 *
 * <p>All fields are validated before the request reaches the service layer.
 * The {@code role} field is optional — it defaults to {@link Role#STUDENT} if omitted.
 */
@Getter
@Setter
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    /**
     * Optional — defaults to {@link Role#STUDENT} when not supplied.
     * Allows a caller to self-register as an INSTRUCTOR during development.
     * (In production you would restrict this to an admin-only flow.)
     */
    private Role role;
}
