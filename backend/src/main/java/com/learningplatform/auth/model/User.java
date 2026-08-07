package com.learningplatform.auth.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * JPA entity representing a registered user.
 *
 * <p>The table is named {@code users} (not {@code user}) because {@code USER} is a
 * reserved keyword in PostgreSQL and would require quoting everywhere.
 *
 * <p>The raw password is never stored — only the BCrypt hash ({@code password_hash}).
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Display name shown in the UI. */
    @Column(name = "full_name", nullable = false)
    private String fullName;

    /** Login identifier — must be unique across the platform. */
    @Column(unique = true, nullable = false)
    private String email;

    /** BCrypt hash of the user's password. Never the raw password. */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    /** Determines what actions the user can perform (create courses vs. take them). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /** Set automatically by Hibernate on INSERT; never updated. */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /** Updated automatically by Hibernate on every UPDATE. */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
