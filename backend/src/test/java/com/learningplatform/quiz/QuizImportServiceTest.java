package com.learningplatform.quiz;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningplatform.quiz.dto.CreateQuestionRequest;
import com.learningplatform.quiz.service.QuizImportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class QuizImportServiceTest {

    private QuizImportService quizImportService;

    @BeforeEach
    void setUp() {
        quizImportService = new QuizImportService(new ObjectMapper());
    }

    @Test
    @DisplayName("parseImportFile - parses custom Excel CSV with Question Number, Options A-D, and A/B/C/D correct letter")
    void parseImportFile_ParsesCustomExcelCsvSuccessfully() {
        String csvContent = """
                Question Number,Question,Option A,Option B,Option C,Option D,Correct Answer,Explanation
                1,What is the correct signature of the main method in Java?,public static void main(String[] args),public void main(String[] args),static void main(String[] args),public static int main(String[] args),A,"In Java, main is entry point."
                2,Which keyword is used to define a constant variable in Java?,const,final,static,immutable,B,"final keyword is used."
                3,Which primitive data type is used to store a single 16-bit Unicode character in Java?,String,char,byte,short,B,"char is primitive type."
                """;

        MockMultipartFile file = new MockMultipartFile("file", "java_mcqs.csv", "text/csv", csvContent.getBytes(StandardCharsets.UTF_8));

        List<CreateQuestionRequest> result = quizImportService.parseImportFile(file);

        assertThat(result).hasSize(3);

        // Q1 checks
        assertThat(result.get(0).getText()).isEqualTo("What is the correct signature of the main method in Java?");
        assertThat(result.get(0).getOptions()).hasSize(4);
        assertThat(result.get(0).getOptions().get(0).getText()).isEqualTo("public static void main(String[] args)");
        assertThat(result.get(0).getOptions().get(0).isCorrect()).isTrue();

        // Q2 checks
        assertThat(result.get(1).getText()).isEqualTo("Which keyword is used to define a constant variable in Java?");
        assertThat(result.get(1).getOptions().get(1).getText()).isEqualTo("final");
        assertThat(result.get(1).getOptions().get(1).isCorrect()).isTrue();

        // Q3 checks
        assertThat(result.get(2).getText()).isEqualTo("Which primitive data type is used to store a single 16-bit Unicode character in Java?");
        assertThat(result.get(2).getOptions().get(1).getText()).isEqualTo("char");
        assertThat(result.get(2).getOptions().get(1).isCorrect()).isTrue();
    }

    @Test
    @DisplayName("parseImportFile - throws IllegalArgumentException when file is empty")
    void parseImportFile_ThrowsOnEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.csv", "text/csv", new byte[0]);

        assertThatThrownBy(() -> quizImportService.parseImportFile(emptyFile))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("empty");
    }
}
