package com.learningplatform.shared.exception;

/**
 * Thrown when a creation request conflicts with existing data
 * (e.g. registering with an email address that is already taken).
 *
 * <p>Mapped to HTTP 409 Conflict by the {@link GlobalExceptionHandler}.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
