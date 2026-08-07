package com.learningplatform.quiz.dto;

import com.learningplatform.quiz.model.Quiz;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Student-facing quiz response for {@code GET /api/courses/{courseId}/quiz}.
 *
 * <p>Includes all questions and their options — but correct flags are hidden
 * (see {@link QuizOptionResponse}).
 */
@Getter
@Builder
@AllArgsConstructor
public class QuizResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final int totalQuestions;

    /** Questions in display order, each with answer options (no correct flag). */
    private final List<QuestionResponse> questions;

    /**
     * Builds a {@link QuizResponse} from a {@link Quiz} entity.
     * Must be called within a transaction so lazy associations are accessible.
     *
     * @param quiz the quiz entity with questions and options loaded
     * @return a populated student-facing quiz response
     */
    public static QuizResponse from(Quiz quiz) {
        List<QuestionResponse> questionResponses = quiz.getQuestions().stream()
                .map(QuestionResponse::from)
                .collect(Collectors.toList());

        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .totalQuestions(questionResponses.size())
                .questions(questionResponses)
                .build();
    }
}
