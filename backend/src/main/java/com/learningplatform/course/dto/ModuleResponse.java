package com.learningplatform.course.dto;

import com.learningplatform.course.model.CourseModule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Response body for a {@link CourseModule}, including its nested lessons.
 */
@Getter
@Builder
@AllArgsConstructor
public class ModuleResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final int orderIndex;

    /** Lessons belonging to this module, sorted by {@code orderIndex}. */
    private final List<LessonResponse> lessons;

    /**
     * Builds a {@link ModuleResponse} from a {@link CourseModule} entity.
     *
     * <p>Accesses {@code module.getLessons()} — must be called within an active
     * Hibernate session (i.e. inside a {@code @Transactional} service method)
     * to avoid {@code LazyInitializationException}.
     *
     * @param module the module entity to convert
     * @return a populated {@link ModuleResponse}
     */
    public static ModuleResponse from(CourseModule module) {
        List<LessonResponse> lessonResponses = module.getLessons().stream()
                .map(LessonResponse::from)
                .collect(Collectors.toList());

        return ModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .orderIndex(module.getOrderIndex())
                .lessons(lessonResponses)
                .build();
    }
}
