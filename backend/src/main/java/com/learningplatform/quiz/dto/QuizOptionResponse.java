package com.learningplatform.quiz.dto;

import com.learningplatform.quiz.model.QuizOption;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Student-facing answer option response — intentionally omits the {@code correct}
 * field so students cannot inspect answers before submitting.
 *
 * <p>The correct flag is only revealed through {@link QuestionResultResponse}
 * after the quiz has been submitted.
 */
@Getter
@Builder
@AllArgsConstructor
public class QuizOptionResponse {

    private final Long id;
    private final String text;

    /**
     * Builds a {@link QuizOptionResponse} from a {@link QuizOption} entity.
     * The {@code correct} field is deliberately excluded.
     *
     * @param option the option entity to convert
     * @return a populated response without the correct flag
     */
    public static QuizOptionResponse from(QuizOption option) {
        return QuizOptionResponse.builder()
                .id(option.getId())
                .text(option.getText())
                .build();
    }
}
