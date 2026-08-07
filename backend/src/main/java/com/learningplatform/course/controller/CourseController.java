package com.learningplatform.course.controller;

import com.learningplatform.course.dto.*;
import com.learningplatform.course.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * Thin REST controller for course and module endpoints.
 *
 * <p>All business logic, authorization checks, and data access live in
 * {@link CourseService} — this controller only handles HTTP mapping and delegates.
 *
 * <p>Role-based access (INSTRUCTOR-only write operations) is enforced by
 * {@link com.learningplatform.shared.config.SecurityConfig} before this controller is reached.
 */
@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final com.learningplatform.course.service.LessonMediaService lessonMediaService;

    /**
     * Lists all courses (lightweight — no modules or lessons).

     *
     * @return 200 OK with a list of {@link CourseListItemResponse}
     */
    @GetMapping
    public ResponseEntity<List<CourseListItemResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    /**
     * Returns full course detail including module and lesson tree.
     *
     * @param id the course ID
     * @return 200 OK with a {@link CourseResponse}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    /**
     * Creates a new course. Restricted to INSTRUCTOR role (enforced by SecurityConfig).
     *
     * @param request   validated course payload
     * @param principal the authenticated user, injected by Spring Security
     * @return 201 Created with the new {@link CourseResponse}
     */
    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(
            @Valid @RequestBody CourseRequest request,
            Principal principal) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(courseService.createCourse(request, principal.getName()));
    }

    /**
     * Updates an existing course's title and/or description.
     * The caller must own the course (enforced in the service layer).
     *
     * @param id        the course ID
     * @param request   validated update payload
     * @param principal the authenticated user
     * @return 200 OK with the updated {@link CourseResponse}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request,
            Principal principal) {
        return ResponseEntity.ok(courseService.updateCourse(id, request, principal.getName()));
    }

    /**
     * Permanently deletes a course and all its modules and lessons.
     * The caller must own the course (enforced in the service layer).
     *
     * @param id        the course ID
     * @param principal the authenticated user
     * @return 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id, Principal principal) {
        courseService.deleteCourse(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * Adds a new module to a course.
     * The caller must own the course (enforced in the service layer).
     *
     * @param courseId  the course to add the module to
     * @param request   validated module payload
     * @param principal the authenticated user
     * @return 201 Created with the new {@link ModuleResponse}
     */
    @PostMapping("/{courseId}/modules")
    public ResponseEntity<ModuleResponse> addModule(
            @PathVariable Long courseId,
            @Valid @RequestBody ModuleRequest request,
            Principal principal) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(courseService.addModule(courseId, request, principal.getName()));
    }

    /**
     * Uploads a local PDF or Video file for a lesson.
     */
    @PostMapping(value = "/lessons/{lessonId}/media", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LessonResponse> uploadLessonMedia(
            @PathVariable Long lessonId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "mediaType", defaultValue = "PDF") String mediaType) throws java.io.IOException {
        return ResponseEntity.ok(lessonMediaService.uploadLessonMedia(lessonId, file, mediaType));
    }
}

