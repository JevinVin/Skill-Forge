package com.learningplatform.quiz.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningplatform.quiz.dto.CreateQuestionRequest;
import com.learningplatform.quiz.dto.QuizOptionRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service for parsing uploaded CSV and JSON files into structured {@link CreateQuestionRequest} objects.
 * Intelligently detects headers, column positions, A/B/C/D letter answers, and 1-based indices.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuizImportService {

    private final ObjectMapper objectMapper;

    /**
     * Parses an uploaded file (.csv or .json) into a list of questions with options.
     *
     * @param file the uploaded multipart file
     * @return a list of parsed {@link CreateQuestionRequest} DTOs
     * @throws IllegalArgumentException if the file is empty, unsupported format, or malformed
     */
    public List<CreateQuestionRequest> parseImportFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        if (fileName.endsWith(".json") || "application/json".equalsIgnoreCase(file.getContentType())) {
            return parseJson(file);
        } else if (fileName.endsWith(".csv") || "text/csv".equalsIgnoreCase(file.getContentType())) {
            return parseCsv(file);
        } else {
            try {
                return parseJson(file);
            } catch (Exception jsonEx) {
                try {
                    return parseCsv(file);
                } catch (Exception csvEx) {
                    throw new IllegalArgumentException("Unsupported file format. Please upload a .csv or .json file.");
                }
            }
        }
    }

    private List<CreateQuestionRequest> parseJson(MultipartFile file) {
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            List<Map<String, Object>> rawList = objectMapper.readValue(content, new TypeReference<>() {});
            List<CreateQuestionRequest> result = new ArrayList<>();

            for (Map<String, Object> item : rawList) {
                String questionText = (String) item.getOrDefault("question", item.get("text"));
                if (questionText == null || questionText.trim().isEmpty()) continue;

                List<QuizOptionRequest> options = new ArrayList<>();

                if (item.containsKey("options") && item.get("options") instanceof List) {
                    List<Map<String, Object>> optsRaw = (List<Map<String, Object>>) item.get("options");
                    for (Map<String, Object> optMap : optsRaw) {
                        String optText = (String) optMap.get("text");
                        Boolean isCorrect = (Boolean) optMap.getOrDefault("correct", false);
                        if (optText != null && !optText.trim().isEmpty()) {
                            options.add(new QuizOptionRequest(optText.trim(), Boolean.TRUE.equals(isCorrect)));
                        }
                    }
                } else {
                    String opt1 = (String) item.getOrDefault("option1", item.get("optionA"));
                    String opt2 = (String) item.getOrDefault("option2", item.get("optionB"));
                    String opt3 = (String) item.getOrDefault("option3", item.get("optionC"));
                    String opt4 = (String) item.getOrDefault("option4", item.get("optionD"));

                    Object correctObj = item.getOrDefault("correct", item.get("correctAnswer"));
                    int correctIdx = parseCorrectIndex(correctObj, List.of(opt1 != null ? opt1 : "", opt2 != null ? opt2 : "", opt3 != null ? opt3 : "", opt4 != null ? opt4 : ""));

                    String[] rawOpts = {opt1, opt2, opt3, opt4};
                    for (int i = 0; i < rawOpts.length; i++) {
                        if (rawOpts[i] != null && !rawOpts[i].trim().isEmpty()) {
                            options.add(new QuizOptionRequest(rawOpts[i].trim(), i == correctIdx));
                        }
                    }
                }

                if (options.size() >= 2) {
                    CreateQuestionRequest req = new CreateQuestionRequest();
                    req.setText(questionText.trim());
                    req.setOptions(options);
                    result.add(req);
                }
            }

            if (result.isEmpty()) {
                throw new IllegalArgumentException("No valid questions found in JSON file.");
            }

            return result;
        } catch (Exception e) {
            log.error("Failed to parse JSON quiz file", e);
            throw new IllegalArgumentException("Failed to parse JSON file: " + e.getMessage());
        }
    }

    private List<CreateQuestionRequest> parseCsv(MultipartFile file) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<CreateQuestionRequest> result = new ArrayList<>();
            String line;

            int questionCol = -1;
            int optACol = -1;
            int optBCol = -1;
            int optCCol = -1;
            int optDCol = -1;
            int correctCol = -1;

            boolean headerProcessed = false;

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;

                String[] tokens = parseCsvLine(line);
                if (tokens.length < 3) continue;

                // Check if this line is the header line
                if (!headerProcessed && isHeaderLine(tokens)) {
                    headerProcessed = true;
                    // Analyze header column indices
                    for (int i = 0; i < tokens.length; i++) {
                        String h = tokens[i].trim().toLowerCase();
                        if (h.equals("question") || h.equals("question text") || (h.contains("question") && !h.contains("number") && !h.contains("no") && !h.contains("id"))) {
                            questionCol = i;
                        } else if (h.contains("option a") || h.contains("option 1") || h.equals("a")) {
                            optACol = i;
                        } else if (h.contains("option b") || h.contains("option 2") || h.equals("b")) {
                            optBCol = i;
                        } else if (h.contains("option c") || h.contains("option 3") || h.equals("c")) {
                            optCCol = i;
                        } else if (h.contains("option d") || h.contains("option 4") || h.equals("d")) {
                            optDCol = i;
                        } else if (h.contains("correct") || h.contains("answer")) {
                            correctCol = i;
                        }
                    }
                    continue; // Skip processing the header row as data
                }

                headerProcessed = true; // Any subsequent row is data

                String questionText = "";
                List<String> rawOptions = new ArrayList<>();
                String correctStr = "";

                if (questionCol != -1 && questionCol < tokens.length) {
                    // Header-based mapping
                    questionText = tokens[questionCol].trim();

                    if (optACol != -1 && optACol < tokens.length) rawOptions.add(tokens[optACol].trim());
                    if (optBCol != -1 && optBCol < tokens.length) rawOptions.add(tokens[optBCol].trim());
                    if (optCCol != -1 && optCCol < tokens.length) rawOptions.add(tokens[optCCol].trim());
                    if (optDCol != -1 && optDCol < tokens.length) rawOptions.add(tokens[optDCol].trim());

                    if (correctCol != -1 && correctCol < tokens.length) {
                        correctStr = tokens[correctCol].trim();
                    }
                } else {
                    // Positional fallback mapping
                    int startCol = 0;

                    // If col 0 looks like a question number / ID (e.g. "1", "2"), skip col 0
                    if (tokens.length >= 6 && isNumeric(tokens[0].trim())) {
                        startCol = 1;
                    }

                    questionText = tokens[startCol].trim();
                    int endOptCol = tokens.length - 1;

                    for (int i = startCol + 1; i < endOptCol; i++) {
                        if (!tokens[i].trim().isEmpty()) {
                            rawOptions.add(tokens[i].trim());
                        }
                    }

                    if (endOptCol < tokens.length) {
                        correctStr = tokens[endOptCol].trim();
                    }
                }

                if (questionText.isEmpty()) continue;

                int correctIdx = parseCorrectIndex(correctStr, rawOptions);

                List<QuizOptionRequest> options = new ArrayList<>();
                for (int i = 0; i < rawOptions.size(); i++) {
                    if (!rawOptions.get(i).isEmpty()) {
                        options.add(new QuizOptionRequest(rawOptions.get(i), i == correctIdx));
                    }
                }

                if (options.size() >= 2) {
                    CreateQuestionRequest req = new CreateQuestionRequest();
                    req.setText(questionText);
                    req.setOptions(options);
                    result.add(req);
                }
            }

            if (result.isEmpty()) {
                throw new IllegalArgumentException("No valid questions found in CSV file.");
            }

            return result;
        } catch (Exception e) {
            log.error("Failed to parse CSV quiz file", e);
            throw new IllegalArgumentException("Failed to parse CSV file: " + e.getMessage());
        }
    }

    private boolean isHeaderLine(String[] tokens) {
        for (String t : tokens) {
            String lower = t.trim().toLowerCase();
            if (lower.contains("question") || lower.contains("option") || lower.contains("correct") || lower.contains("answer")) {
                return true;
            }
        }
        return false;
    }

    private boolean isNumeric(String str) {
        if (str == null || str.isEmpty()) return false;
        try {
            Double.parseDouble(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private int parseCorrectIndex(Object correctObj, List<String> options) {
        if (correctObj == null) return 0;

        String str = correctObj.toString().trim();

        // Handle letter choices: "A" / "a" -> 0, "B" / "b" -> 1, "C" / "c" -> 2, "D" / "d" -> 3
        if (str.equalsIgnoreCase("a") || str.startsWith("A.") || str.startsWith("a.")) return 0;
        if (str.equalsIgnoreCase("b") || str.startsWith("B.") || str.startsWith("b.")) return 1;
        if (str.equalsIgnoreCase("c") || str.startsWith("C.") || str.startsWith("c.")) return 2;
        if (str.equalsIgnoreCase("d") || str.startsWith("D.") || str.startsWith("d.")) return 3;

        // Handle 1-based numeric indices: "1" -> 0, "2" -> 1, "3" -> 2, "4" -> 3
        try {
            int idx = Integer.parseInt(str) - 1;
            if (idx >= 0 && idx < options.size()) {
                return idx;
            }
        } catch (NumberFormatException ignored) {
        }

        // Match option text directly
        for (int i = 0; i < options.size(); i++) {
            if (options.get(i) != null && options.get(i).equalsIgnoreCase(str)) {
                return i;
            }
        }

        return 0; // Default to first option if unmatched
    }

    private String[] parseCsvLine(String line) {
        List<String> tokens = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"' || c == '\'') {
                // If it's a quote, toggle state
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                tokens.add(sb.toString());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        tokens.add(sb.toString());
        return tokens.toArray(new String[0]);
    }
}
