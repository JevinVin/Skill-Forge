package com.learningplatform.ai.service;

import com.learningplatform.ai.dto.AiQueryRequest;
import com.learningplatform.ai.dto.AiQueryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service providing context-aware AI Tutor guidance for course lessons
 * and answering questions regarding Skillforge platform features.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiTutorService {

    /**
     * Answers a student's query using course/lesson context and platform knowledge base rules.
     */
    public AiQueryResponse askTutor(AiQueryRequest request) {
        String q = request.getQuestion() != null ? request.getQuestion().trim().toLowerCase() : "";
        String courseTitle = request.getCourseTitle() != null ? request.getCourseTitle() : "Skillforge Course";
        String lessonTitle = request.getLessonTitle() != null ? request.getLessonTitle() : "Current Lesson";
        String lessonContent = request.getLessonContent() != null ? request.getLessonContent() : "";

        StringBuilder answer = new StringBuilder();
        String contextUsed = "General Knowledge Base";
        List<String> followUps = new ArrayList<>();

        // 1. Platform Knowledge Queries
        if (q.contains("module") && (q.contains("quiz") || q.contains("complet") || q.contains("pass") || q.contains("score") || q.contains("rule"))) {
            contextUsed = "Skillforge Module Completion Rule";
            answer.append("### 🎯 Skillforge Module Completion Rules\n\n");
            answer.append("To mark a module as **Completed ✓** on Skillforge:\n");
            answer.append("1. **Complete all lessons** (Text, PDF, or Video) inside the module.\n");
            answer.append("2. **Pass the Module Quiz with 100% Accuracy** (100.0% score).\n\n");
            answer.append("Once achieved, the module badge turns green with **Done ✓**!");
            followUps.add("How do I retake a module quiz?");
            followUps.add("How do final course quizzes work?");
        } else if (q.contains("import") || q.contains("csv") || q.contains("json") || q.contains("excel") || q.contains("bulk")) {
            contextUsed = "Skillforge Bulk Quiz Import Guide";
            answer.append("### 📁 Bulk Quiz Import Guide\n\n");
            answer.append("Instructors can import quiz questions in bulk using **CSV** or **JSON** files:\n");
            answer.append("- **CSV Format**: `Question Number,Question,Option A,Option B,Option C,Option D,Correct Answer`\n");
            answer.append("- **Correct Answers**: Supports letters (`A`, `B`, `C`, `D`) or numbers (`1`, `2`, `3`, `4`).\n");
            answer.append("- Simply click **📁 Import CSV/JSON** on any quiz modal to upload!");
            followUps.add("Can I import quizzes for a single module?");
            followUps.add("What format should my JSON file be in?");
        } else if (q.contains("badge") || q.contains("reward") || q.contains("achievement") || q.contains("dashboard")) {
            contextUsed = "Skillforge Achievements & Dashboard";
            answer.append("### 🏆 Skillforge Achievement Badges\n\n");
            answer.append("You can unlock 4 achievement badges on your Dashboard:\n");
            answer.append("- 🚀 **First Steps**: Complete your first lesson.\n");
            answer.append("- 🎯 **Quiz Explorer**: Submit your first quiz.\n");
            answer.append("- 🏆 **Quiz Master**: Score 100% on any quiz.\n");
            answer.append("- 🎓 **Course Graduate**: Fully complete a course.\n");
            followUps.add("Where can I view my progress bars?");
            followUps.add("How is my average score calculated?");
        } else if (q.contains("pdf") || q.contains("video") || q.contains("doc") || q.contains("fullscreen") || q.contains("media")) {
            contextUsed = "Skillforge Multi-Media Lesson Reader";
            answer.append("### 📄 Multi-Media Lesson Viewer\n\n");
            answer.append("Skillforge supports 3 rich lesson formats:\n");
            answer.append("- 📝 **Website Text**: Styled markdown text natively on webpage.\n");
            answer.append("- 📄 **Mozilla PDF.js Canvas Viewer**: Rendered directly on webpage with Page Controls & Fullscreen mode.\n");
            answer.append("- 🎥 **Video Player**: Supports YouTube links & local MP4 uploads.\n");
            followUps.add("How do I switch to Fullscreen reading mode?");
            followUps.add("Can I download the PDF file?");
        }
        // 2. Lesson Content Queries (Specific to active lesson)
        else if (q.contains("explain") || q.contains("summary") || q.contains("summarize") || q.contains("what is") || q.contains("help")) {
            contextUsed = "Lesson Context: " + lessonTitle;
            answer.append("### 💡 Explanation for: ").append(lessonTitle).append("\n\n");
            if (!lessonContent.isEmpty()) {
                answer.append("Here is a breakdown of the key concepts from **").append(lessonTitle).append("**:\n\n");
                String preview = lessonContent.length() > 300 ? lessonContent.substring(0, 300) + "..." : lessonContent;
                answer.append("> ").append(preview).append("\n\n");
                answer.append("**Key Takeaways:**\n");
                answer.append("- Read through the material step-by-step.\n");
                answer.append("- Review the code examples and study notes.\n");
                answer.append("- Attempt the **Module Quiz** when ready to test your 100% mastery!");
            } else {
                answer.append("This lesson (**").append(lessonTitle).append("**) is part of the course **").append(courseTitle).append("**.\n");
                answer.append("Go through the lesson content and click **✓ Mark as Complete** when finished!");
            }
            followUps.add("Give me a quick 3-bullet summary");
            followUps.add("How do I complete this module?");
        }
        // 3. Fallback General Assistant Answer
        else {
            contextUsed = "General Skillforge AI Assistant";
            answer.append("### 🤖 Skillforge AI Assistant\n\n");
            answer.append("I am your AI Learning Assistant for **").append(courseTitle).append("**!\n\n");
            answer.append("You can ask me to:\n");
            answer.append("1. **Explain lesson concepts** or summarize study materials.\n");
            answer.append("2. **Guide you on platform rules** (100% module quizzes, badges, progress bars).\n");
            answer.append("3. **Help with bulk CSV/JSON imports** or uploading rich media (PDFs & videos).\n\n");
            answer.append("How can I assist your study session today?");
            followUps.add("Explain this lesson in simple terms");
            followUps.add("How do module quizzes work?");
        }

        log.info("AI Tutor query answered: '{}' using context [{}]", q, contextUsed);

        return AiQueryResponse.builder()
                .answer(answer.toString())
                .contextUsed(contextUsed)
                .suggestedFollowUps(followUps)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
