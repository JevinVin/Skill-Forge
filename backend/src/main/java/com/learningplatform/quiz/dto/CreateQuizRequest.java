package com.learningplatform.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for {@code POST /api/courses/{courseId}/quiz} (create quiz).
 */
@Getter
@Setter
@NoArgsConstructor
public class CreateQuizRequest {

    @NotBlank(message = "Quiz title is required")
    private String title;

    private String description;
}
