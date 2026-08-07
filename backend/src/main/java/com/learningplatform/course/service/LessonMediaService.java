package com.learningplatform.course.service;

import com.learningplatform.course.dto.LessonResponse;
import com.learningplatform.course.model.Lesson;
import com.learningplatform.course.model.LessonType;
import com.learningplatform.course.repository.LessonRepository;
import com.learningplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service for handling local PDF and Video file uploads attached to lessons.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LessonMediaService {

    private final LessonRepository lessonRepository;

    private static final String UPLOAD_DIR = "uploads/lessons/";

    /**
     * Stores an uploaded PDF or Video file and updates the lesson's mediaUrl and lessonType.
     */
    @Transactional
    public LessonResponse uploadLessonMedia(Long lessonId, MultipartFile file, String mediaType) throws IOException {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "file"
        );
        String fileExt = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx > 0) {
            fileExt = originalFilename.substring(dotIdx);
        }

        String uniqueFileName = UUID.randomUUID() + fileExt;
        Path uploadPath = Paths.get(UPLOAD_DIR);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String mediaUrl = "/uploads/lessons/" + uniqueFileName;
        lesson.setMediaUrl(mediaUrl);

        if ("PDF".equalsIgnoreCase(mediaType) || fileExt.equalsIgnoreCase(".pdf")) {
            lesson.setLessonType(LessonType.PDF);
        } else if ("VIDEO".equalsIgnoreCase(mediaType) || isVideoExtension(fileExt)) {
            lesson.setLessonType(LessonType.VIDEO);
            lesson.setVideoType("LOCAL");
        }

        Lesson saved = lessonRepository.save(lesson);
        log.info("Media uploaded for lesson id {}: {}", lessonId, mediaUrl);
        return LessonResponse.from(saved);
    }

    private boolean isVideoExtension(String ext) {
        String lower = ext.toLowerCase();
        return lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".ogg") || lower.endsWith(".mov");
    }
}
