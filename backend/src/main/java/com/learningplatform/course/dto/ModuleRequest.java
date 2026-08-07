package com.learningplatform.course.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for adding a module to a course.
 */
@Getter
@Setter
@NoArgsConstructor
public class ModuleRequest {

    @NotBlank(message = "Module title is required")
    private String title;

    private String description;
}
