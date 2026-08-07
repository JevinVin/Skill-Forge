package com.learningplatform.course.dto;

import com.learningplatform.course.model.Course;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Full course detail response including the complete module and lesson tree.
 *
 * <p>Returned by {@code GET /api/courses/{id}} and all write operations
 * (create, update) so the caller immediately has the up-to-date state.
 *
 * <p>All nested entity accesses happen during DTO construction — call this
 * inside a {@code @Transactional} service method or ensure associations are
 * eagerly loaded via {@code JOIN FETCH} before conversion.
 */
@Getter
@Builder
@AllArgsConstructor
public class CourseResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final String instructorName;
    private final String instructorEmail;
    private final Long instructorId;

    /** Modules ordered by {@code orderIndex}, each containing their lessons. */
    private final List<ModuleResponse> modules;

    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    /**
     * Builds a {@link CourseResponse} from a {@link Course} entity.
     *
     * @param course the course entity with instructor and modules fully loaded
     * @return a populated {@link CourseResponse}
     */
    public static CourseResponse from(Course course) {
        List<ModuleResponse> moduleResponses = course.getModules().stream()
                .map(ModuleResponse::from)
                .collect(Collectors.toList());

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .instructorName(course.getInstructor().getFullName())
                .instructorEmail(course.getInstructor().getEmail())
                .instructorId(course.getInstructor().getId())
                .modules(moduleResponses)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
