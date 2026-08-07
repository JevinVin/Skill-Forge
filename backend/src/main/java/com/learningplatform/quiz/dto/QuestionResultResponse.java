package com.learningplatform.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Per-question result included in {@link QuizResultResponse}.
 *
 * <p>Reveals the correct option ID and text (hidden during the quiz) so the student
 * can see which answers they got wrong and learn from the result without needing
 * to cross-reference the original quiz payload.
 */
@Getter
@Builder
@AllArgsConstructor
public class QuestionResultResponse {

    private final Long questionId;
    private final String questionText;

    /** The option ID the student selected, or {@code null} if unanswered. */
    private final Long selectedOptionId;

    /** The display text of the student's selected option, or {@code null} if unanswered. */
    private final String selectedOptionText;

    /** The ID of the correct option for this question. */
    private final Long correctOptionId;

    /** The display text of the correct option — shown after submission for review. */
    private final String correctOptionText;

    /** Whether the student's selected option was the correct one. */
    private final boolean correct;
}
