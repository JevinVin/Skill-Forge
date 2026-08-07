package com.learningplatform.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One answer option included in a {@link CreateQuestionRequest}.
 *
 * <p>The {@code correct} flag is part of the instructor's create payload —
 * it is stored server-side but never returned in the student-facing quiz response.
 */
@Getter
@Setter
@NoArgsConstructor
@lombok.AllArgsConstructor
public class QuizOptionRequest {


    @NotBlank(message = "Option text is required")
    private String text;

    /**
     * Marks this option as the correct answer.
     * At least one option per question should have {@code correct = true}.
     */
    private boolean correct;
}
