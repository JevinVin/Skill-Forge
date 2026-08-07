package com.learningplatform.course.controller;

import com.learningplatform.course.dto.LessonRequest;
import com.learningplatform.course.dto.LessonResponse;
import com.learningplatform.course.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * Thin REST controller for lesson operations.
 *
 * <p>Lessons are sub-resources of modules, so this controller is mapped to
 * {@code /api/modules} rather than {@code /api/courses} to keep the URL structure
 * clean and RESTful.
 *
 * <p>All logic is delegated to {@link CourseService}.
 */
@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final CourseService courseService;

    /**
     * Adds a new lesson to a module.
     * The caller must own the parent course (enforced in the service layer).
     *
     * @param moduleId  the module to add the lesson to
     * @param request   validated lesson payload
     * @param principal the authenticated user
     * @return 201 Created with the new {@link LessonResponse}
     */
    @PostMapping("/{moduleId}/lessons")
    public ResponseEntity<LessonResponse> addLesson(
            @PathVariable Long moduleId,
            @Valid @RequestBody LessonRequest request,
            Principal principal) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(courseService.addLesson(moduleId, request, principal.getName()));
    }
}
