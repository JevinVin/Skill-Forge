package com.learningplatform.course.dto;

import com.learningplatform.course.model.Lesson;
import com.learningplatform.course.model.LessonType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Response body for a single {@link com.learningplatform.course.model.Lesson}.
 */
@Getter
@Builder
@AllArgsConstructor
public class LessonResponse {

    private final Long id;
    private final String title;
    private final String content;
    private final int orderIndex;
    private final LessonType lessonType;
    private final String mediaUrl;
    private final String videoType;

    /**
     * Builds a {@link LessonResponse} from a {@link Lesson} entity.
     *
     * @param lesson the lesson entity to convert
     * @return a populated {@link LessonResponse}
     */
    public static LessonResponse from(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .orderIndex(lesson.getOrderIndex())
                .lessonType(lesson.getLessonType() != null ? lesson.getLessonType() : LessonType.TEXT)
                .mediaUrl(lesson.getMediaUrl())
                .videoType(lesson.getVideoType())
                .build();
    }
}
