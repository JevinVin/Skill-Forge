package com.learningplatform.quiz.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Request body for {@code POST /api/courses/{courseId}/quiz/questions}.
 *
 * <p>A question and all its options are submitted together in a single request —
 * this avoids a separate round-trip for each option and ensures the question is
 * never persisted without any choices.
 */
@Getter
@Setter
@NoArgsConstructor
public class CreateQuestionRequest {

    @NotBlank(message = "Question text is required")
    private String text;

    /**
     * Answer options for this question. Minimum 2, maximum 6.
     * Each option is validated independently via {@code @Valid}.
     */
    @NotEmpty(message = "At least one option is required")
    @Size(min = 2, max = 6, message = "A question must have between 2 and 6 options")
    @Valid
    private List<QuizOptionRequest> options;
}
