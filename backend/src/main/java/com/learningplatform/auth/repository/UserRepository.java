package com.learningplatform.auth.repository;

import com.learningplatform.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Data access layer for {@link User} entities.
 *
 * <p>All DB queries for users go here — no raw SQL or JPQL in service classes.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their email address.
     *
     * @param email the email to search for
     * @return an {@link Optional} containing the user, or empty if not found
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks whether a user with the given email already exists.
     * Used during registration to detect duplicates without loading the full entity.
     *
     * @param email the email to check
     * @return {@code true} if any user has this email
     */
    boolean existsByEmail(String email);
}
