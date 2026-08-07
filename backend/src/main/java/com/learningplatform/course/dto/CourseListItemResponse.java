package com.learningplatform.course.dto;

import com.learningplatform.course.model.Course;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Lightweight course summary used by the {@code GET /api/courses} list endpoint.
 *
 * <p>Intentionally excludes modules and lessons to keep the list payload small.
 * Use {@link CourseResponse} for the full detail view.
 */
@Getter
@Builder
@AllArgsConstructor
public class CourseListItemResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final String instructorName;
    private final Long instructorId;
    private final LocalDateTime createdAt;

    /**
     * Builds a {@link CourseListItemResponse} from a {@link Course} entity.
     *
     * <p>Accesses {@code course.getInstructor()} — ensure the instructor is
     * eagerly loaded (via {@code JOIN FETCH}) before calling this method.
     *
     * @param course the course entity (instructor must be loaded)
     * @return a populated list-item response
     */
    public static CourseListItemResponse from(Course course) {
        return CourseListItemResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .instructorName(course.getInstructor().getFullName())
                .instructorId(course.getInstructor().getId())
                .createdAt(course.getCreatedAt())
                .build();
    }
}
