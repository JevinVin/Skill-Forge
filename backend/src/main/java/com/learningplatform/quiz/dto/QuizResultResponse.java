package com.learningplatform.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Response body for {@code POST /api/courses/{courseId}/quiz/submit}.
 *
 * <p>Contains the overall score and a per-question breakdown so the student can
 * see exactly which answers they got right and wrong.
 */
@Getter
@Builder
@AllArgsConstructor
public class QuizResultResponse {

    /** ID of the persisted {@link com.learningplatform.quiz.model.QuizSubmission}. */
    private final Long submissionId;

    /** Number of correctly answered questions. */
    private final int score;

    /** Total number of questions in the quiz. */
    private final int totalQuestions;

    /**
     * Score expressed as a percentage (0.0–100.0).
     * {@code score / totalQuestions * 100}, or {@code 0.0} if {@code totalQuestions} is 0.
     */
    private final double percentage;

    /** Per-question breakdown — reveals correct answers for review. */
    private final List<QuestionResultResponse> questionResults;
}
