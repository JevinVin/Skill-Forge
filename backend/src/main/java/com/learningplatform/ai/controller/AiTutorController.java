package com.learningplatform.ai.controller;

import com.learningplatform.ai.dto.AiQueryRequest;
import com.learningplatform.ai.dto.AiQueryResponse;
import com.learningplatform.ai.service.AiTutorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for the AI Assistant Chatbox.
 * Endpoint: {@code POST /api/ai/ask}
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiTutorController {

    private final AiTutorService aiTutorService;

    /**
     * Answers a student query with lesson context and Skillforge platform rules.
     */
    @PostMapping("/ask")
    public ResponseEntity<AiQueryResponse> askTutor(@Valid @RequestBody AiQueryRequest request) {
        return ResponseEntity.ok(aiTutorService.askTutor(request));
    }
}
