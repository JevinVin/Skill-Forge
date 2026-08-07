package com.learningplatform.quiz.controller;

import com.learningplatform.quiz.dto.*;
import com.learningplatform.quiz.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * Thin REST controller for quiz endpoints.
 *
 * <p>All quiz endpoints are nested under {@code /api/courses/{courseId}} to make
 * the course ownership explicit in the URL. All logic is delegated to
 * {@link QuizService}.
 *
 * <p>Access control is a two-layer defence:
 * <ul>
 *   <li>SecurityConfig enforces role rules at the HTTP level.</li>
 *   <li>QuizService re-checks instructor ownership at the business logic level.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/courses/{courseId}/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    /**
     * Creates a quiz for the given course. Restricted to INSTRUCTOR role.
     *
     * @param courseId  the course to attach the quiz to
     * @param request   quiz title and description
     * @param principal the authenticated instructor
     * @return 201 Created with the new {@link QuizResponse}
     */
    @PostMapping
    public ResponseEntity<QuizResponse> createQuiz(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateQuizRequest request,
            Principal principal) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(quizService.createQuiz(courseId, request, principal.getName()));
    }

    /**
     * Adds a question (with its options) to the course's quiz.
     * Restricted to INSTRUCTOR role.
     *
     * @param courseId  the course whose quiz receives the question
     * @param request   question text and list of options
     * @param principal the authenticated instructor
     * @return 201 Created with the updated {@link QuizResponse}
     */
    @PostMapping("/questions")
    public ResponseEntity<QuizResponse> addQuestion(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateQuestionRequest request,
            Principal principal) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(quizService.addQuestion(courseId, request, principal.getName()));
    }

    /**
     * Returns the quiz for the given course with correct answers hidden.
     * Accessible to any authenticated user (students and instructors).
     *
     * @param courseId the course whose quiz to fetch
     * @return 200 OK with a {@link QuizResponse}
     */
    @GetMapping
    public ResponseEntity<QuizResponse> getQuiz(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizService.getQuizByCourseId(courseId));
    }

    /**
     * Submits answers for scoring. Accessible to any authenticated user.
     *
     * @param courseId  the course whose quiz is being submitted
     * @param request   map of {@code questionId → selectedOptionId}
     * @param principal the authenticated user submitting the quiz
     * @return 200 OK with a {@link QuizResultResponse} containing score and per-question breakdown
     */
    @PostMapping("/submit")
    public ResponseEntity<QuizResultResponse> submitQuiz(
            @PathVariable Long courseId,
            @Valid @RequestBody SubmitQuizRequest request,
            Principal principal) {
        return ResponseEntity.ok(quizService.submitQuiz(courseId, request, principal.getName()));
    }

    /**
     * Deletes the quiz for the given course. Restricted to INSTRUCTOR role.
     *
     * @param courseId  the course whose quiz to delete
     * @param principal the authenticated instructor
     * @return 204 No Content
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long courseId, Principal principal) {
        quizService.deleteQuiz(courseId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * Deletes a specific question from a course quiz. Restricted to INSTRUCTOR role.
     *
     * @param courseId   the course ID
     * @param questionId the question ID to delete
     * @param principal  the authenticated instructor
     * @return 200 OK with the updated {@link QuizResponse}
     */
    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<QuizResponse> deleteQuestion(
            @PathVariable Long courseId,
            @PathVariable Long questionId,
            Principal principal) {
        return ResponseEntity.ok(quizService.deleteQuestion(courseId, questionId, principal.getName()));
    }

    /**
     * Updates an existing question and its option choices.
     * Restricted to INSTRUCTOR role.
     *
     * @param courseId   the course ID
     * @param questionId the question ID to update
     * @param request    updated question text and list of options
     * @param principal  the authenticated instructor
     * @return 200 OK with the updated {@link QuizResponse}
     */
    @PutMapping("/questions/{questionId}")
    public ResponseEntity<QuizResponse> updateQuestion(
            @PathVariable Long courseId,
            @PathVariable Long questionId,
            @Valid @RequestBody CreateQuestionRequest request,
            Principal principal) {
        return ResponseEntity.ok(quizService.updateQuestion(courseId, questionId, request, principal.getName()));
    }

    /**
     * Imports questions in bulk from an uploaded CSV or JSON file.
     * Restricted to INSTRUCTOR role.
     *
     * @param courseId  the course ID
     * @param file      the uploaded CSV or JSON file
     * @param principal the authenticated instructor
     * @return 201 Created with the updated {@link QuizResponse}
     */
    @PostMapping(value = "/import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<QuizResponse> importQuiz(
            @PathVariable Long courseId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            Principal principal) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(quizService.importQuizQuestions(courseId, file, principal.getName()));
    }
}

