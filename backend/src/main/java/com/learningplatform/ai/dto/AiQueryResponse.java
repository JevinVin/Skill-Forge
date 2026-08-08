package com.learningplatform.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response payload returned by the AI Tutor Assistant.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiQueryResponse {

    private String answer;
    private String contextUsed;
    private List<String> suggestedFollowUps;
    private LocalDateTime timestamp;
}
