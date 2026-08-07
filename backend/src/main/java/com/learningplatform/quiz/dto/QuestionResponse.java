package com.learningplatform.quiz.dto;

import com.learningplatform.quiz.model.Question;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Student-facing question response — options are included without the correct flag.
 */
@Getter
@Builder
@AllArgsConstructor
public class QuestionResponse {

    private final Long id;
    private final String text;
    private final int orderIndex;

    /** Answer choices — correct flag is hidden (see {@link QuizOptionResponse}). */
    private final List<QuizOptionResponse> options;

    /**
     * Builds a {@link QuestionResponse} from a {@link Question} entity.
     *
     * @param question the question entity (options must be loaded)
     * @return a populated response
     */
    public static QuestionResponse from(Question question) {
        List<QuizOptionResponse> optionResponses = question.getOptions().stream()
                .map(QuizOptionResponse::from)
                .collect(Collectors.toList());

        return QuestionResponse.builder()
                .id(question.getId())
                .text(question.getText())
                .orderIndex(question.getOrderIndex())
                .options(optionResponses)
                .build();
    }
}
