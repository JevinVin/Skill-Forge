package com.learningplatform.shared.exception;

/**
 * Thrown when a caller attempts an operation they are not permitted to perform
 * (e.g. a student trying to create a course).
 *
 * <p>Mapped to HTTP 403 by the {@link GlobalExceptionHandler}.
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
