package com.learningplatform.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload for asking the AI Tutor Assistant a question.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiQueryRequest {

    @NotBlank(message = "Question text is required")
    private String question;

    private String courseTitle;
    private String lessonTitle;
    private String lessonContent;
}
