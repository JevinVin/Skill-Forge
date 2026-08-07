package com.learningplatform.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Standardised error envelope returned by every API error response.
 *
 * <p>Shape: {@code { "error": "Human-readable message", "code": "MACHINE_CODE" }}
 *
 * <p>Using a consistent shape across all endpoints makes it straightforward for
 * the React frontend to handle errors generically.
 *
 * @param error Human-readable description of what went wrong.
 * @param code  Machine-readable error code (e.g. RESOURCE_NOT_FOUND, VALIDATION_ERROR).
 */
@Getter
@AllArgsConstructor
public class ErrorResponse {

    private final String error;
    private final String code;
}
