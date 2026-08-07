package com.learningplatform.quiz.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

/**
 * Request body for {@code POST /api/courses/{courseId}/quiz/submit}.
 *
 * <p>The {@code answers} map keys are question IDs and values are the selected
 * option IDs. Questions not included in the map are treated as unanswered
 * (scored as incorrect).
 */
@Getter
@Setter
@NoArgsConstructor
public class SubmitQuizRequest {

    /**
     * Map of {@code questionId → selectedOptionId}.
     * Must not be null, but may be empty (all questions treated as unanswered → score 0).
     */
    @NotNull(message = "Answers map must be provided (may be empty)")
    private Map<Long, Long> answers;
}
