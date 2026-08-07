package com.learningplatform.course.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for creating or updating a {@link com.learningplatform.course.model.Course}.
 */
@Getter
@Setter
@NoArgsConstructor
public class CourseRequest {

    @NotBlank(message = "Course title is required")
    private String title;

    /** Optional — may be left blank during initial creation. */
    private String description;
}
