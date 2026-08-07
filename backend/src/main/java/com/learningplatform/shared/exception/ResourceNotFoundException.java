package com.learningplatform.shared.exception;

/**
 * Thrown when a requested resource (course, user, quiz, etc.) does not exist.
 *
 * <p>The {@link com.learningplatform.shared.exception.GlobalExceptionHandler} maps
 * this to a 404 response with the standard {@code ErrorResponse} envelope.
 *
 * @param message Description identifying what was not found (e.g. "Course not found with id: 42").
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
