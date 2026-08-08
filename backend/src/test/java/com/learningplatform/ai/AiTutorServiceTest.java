package com.learningplatform.ai;

import com.learningplatform.ai.dto.AiQueryRequest;
import com.learningplatform.ai.dto.AiQueryResponse;
import com.learningplatform.ai.service.AiTutorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AiTutorServiceTest {

    private AiTutorService aiTutorService;

    @BeforeEach
    void setUp() {
        aiTutorService = new AiTutorService();
    }

    @Test
    @DisplayName("askTutor - answers module quiz completion rules correctly")
    void askTutor_AnswersModuleCompletionRules() {
        AiQueryRequest request = AiQueryRequest.builder()
                .question("How do I complete a module?")
                .courseTitle("Java Basics")
                .lessonTitle("Syntax")
                .build();

        AiQueryResponse response = aiTutorService.askTutor(request);

        assertThat(response.getAnswer()).contains("100% Accuracy");
        assertThat(response.getContextUsed()).isEqualTo("Skillforge Module Completion Rule");
        assertThat(response.getSuggestedFollowUps()).isNotEmpty();
    }

    @Test
    @DisplayName("askTutor - provides lesson explanation using lesson context")
    void askTutor_ProvidesLessonExplanation() {
        AiQueryRequest request = AiQueryRequest.builder()
                .question("Can you explain this lesson?")
                .courseTitle("Java Basics")
                .lessonTitle("Variables and Types")
                .lessonContent("Primitive types store simple values like int and char.")
                .build();

        AiQueryResponse response = aiTutorService.askTutor(request);

        assertThat(response.getAnswer()).contains("Primitive types");
        assertThat(response.getContextUsed()).contains("Variables and Types");
    }
}
