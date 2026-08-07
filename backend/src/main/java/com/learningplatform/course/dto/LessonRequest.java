package com.learningplatform.course.dto;

import com.learningplatform.course.model.LessonType;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for adding or updating a lesson in a module.
 */
@Getter
@Setter
@NoArgsConstructor
public class LessonRequest {

    @NotBlank(message = "Lesson title is required")
    private String title;

    /** The lesson body — plain text or markdown explanation. */
    private String content;

    /** Type of lesson content: TEXT, PDF, VIDEO */
    private LessonType lessonType = LessonType.TEXT;

    /** URL for uploaded PDF, local video, or YouTube embed link */
    private String mediaUrl;

    /** YOUTUBE or LOCAL (applicable if lessonType == VIDEO) */
    private String videoType;
}
