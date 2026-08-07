package com.learningplatform.quiz.controller;

import com.learningplatform.quiz.dto.*;
import com.learningplatform.quiz.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

/**
 * REST controller for per-module quiz endpoints under {@code /api/modules/{moduleId}/quiz}.
 */
@RestController
@RequestMapping("/api/modules/{moduleId}/quiz")
@RequiredArgsConstructor
public class ModuleQuizController {

    private final QuizService quizService;

    @PostMapping
    public ResponseEntity<QuizResponse> createModuleQuiz(
            @PathVariable Long moduleId,
            @Valid @RequestBody CreateQuizRequest request,
            Principal principal) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(quizService.createModuleQuiz(moduleId, request, principal.getName()));
    }

    @GetMapping
    public ResponseEntity<QuizResponse> getModuleQuiz(@PathVariable Long moduleId) {
        return ResponseEntity.ok(quizService.getModuleQuiz(moduleId));
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizResultResponse> submitModuleQuiz(
            @PathVariable Long moduleId,
            @Valid @RequestBody SubmitQuizRequest request,
            Principal principal) {
        return ResponseEntity.ok(quizService.submitModuleQuiz(moduleId, request, principal.getName()));
    }

    @PostMapping("/questions")
    public ResponseEntity<QuizResponse> addModuleQuestion(
            @PathVariable Long moduleId,
            @Valid @RequestBody CreateQuestionRequest request,
            Principal principal) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(quizService.addModuleQuestion(moduleId, request, principal.getName()));
    }

    @PostMapping(value = "/import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<QuizResponse> importModuleQuiz(
            @PathVariable Long moduleId,
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(quizService.importModuleQuizQuestions(moduleId, file, principal.getName()));
    }
}
