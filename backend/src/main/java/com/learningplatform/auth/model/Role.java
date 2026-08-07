package com.learningplatform.auth.model;

/**
 * The two roles a user can hold in the platform.
 *
 * <ul>
 *   <li>{@code STUDENT} — can view courses and submit quizzes.</li>
 *   <li>{@code INSTRUCTOR} — can create, update, and delete courses and quizzes.</li>
 * </ul>
 *
 * Stored as a {@code VARCHAR} column (via {@code @Enumerated(EnumType.STRING)})
 * so that adding new values in future migrations doesn't break existing rows.
 */
public enum Role {
    STUDENT,
    INSTRUCTOR
}
