package com.learningplatform.course.service;

import com.learningplatform.auth.model.Role;
import com.learningplatform.auth.model.User;
import com.learningplatform.auth.repository.UserRepository;
import com.learningplatform.course.dto.*;
import com.learningplatform.course.model.Course;
import com.learningplatform.course.model.CourseModule;
import com.learningplatform.course.model.Lesson;
import com.learningplatform.course.model.LessonType;

import com.learningplatform.course.repository.CourseModuleRepository;
import com.learningplatform.course.repository.CourseRepository;
import com.learningplatform.course.repository.LessonRepository;
import com.learningplatform.shared.exception.ForbiddenException;
import com.learningplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for course, module, and lesson management.
 *
 * <p>Ownership enforcement: an instructor may only modify courses they created.
 * The caller's email is passed in from the controller via the {@link java.security.Principal},
 * keeping the service layer decoupled from Spring Security internals.
 *
 * <p>All read methods use {@code @Transactional(readOnly = true)} so that Hibernate
 * can optimise read-only sessions and lazy associations are still accessible within
 * the transaction boundary when converting entities to DTOs.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    // ── Course CRUD ──────────────────────────────────────────────────────────

    /**
     * Returns a lightweight list of all courses (no modules/lessons included).
     *
     * @return list of {@link CourseListItemResponse}, newest first
     */
    @Transactional(readOnly = true)
    public List<CourseListItemResponse> getAllCourses() {
        return courseRepository.findAllWithInstructor().stream()
                .map(CourseListItemResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Returns the full detail for a single course, including its module and lesson tree.
     *
     * @param courseId the course ID
     * @return a {@link CourseResponse} with all nested data
     * @throws ResourceNotFoundException if no course exists with that ID
     */
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long courseId) {
        Course course = courseRepository.findByIdWithDetails(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + courseId));
        return CourseResponse.from(course);
    }

    /**
     * Creates a new course owned by the calling instructor.
     *
     * @param request        course title and description
     * @param instructorEmail the email of the authenticated user (must have INSTRUCTOR role)
     * @return the created course as a {@link CourseResponse}
     * @throws ForbiddenException if the caller does not have the INSTRUCTOR role
     */
    @Transactional
    public CourseResponse createCourse(CourseRequest request, String instructorEmail) {
        User instructor = loadUser(instructorEmail);

        // Role is also enforced by SecurityConfig — this is a defence-in-depth check
        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new ForbiddenException("Only instructors can create courses");
        }

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .instructor(instructor)
                .build();

        Course saved = courseRepository.save(course);
        log.info("Course created: '{}' by {}", saved.getTitle(), instructorEmail);
        return CourseResponse.from(saved);
    }

    /**
     * Updates the title and description of an existing course.
     * The caller must be the course's owner.
     *
     * @param courseId        the course to update
     * @param request         the new title/description
     * @param instructorEmail the authenticated caller's email
     * @return the updated course as a {@link CourseResponse}
     * @throws ResourceNotFoundException if the course doesn't exist
     * @throws ForbiddenException        if the caller doesn't own the course
     */
    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseRequest request, String instructorEmail) {
        Course course = loadCourseWithDetails(courseId);
        verifyOwnership(course, instructorEmail, "update");

        course.setTitle(request.getTitle());
        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }

        log.info("Course updated: id={} by {}", courseId, instructorEmail);
        return CourseResponse.from(courseRepository.save(course));
    }

    /**
     * Permanently deletes a course and all its modules and lessons (cascade).
     * The caller must be the course's owner.
     *
     * @param courseId        the course to delete
     * @param instructorEmail the authenticated caller's email
     * @throws ResourceNotFoundException if the course doesn't exist
     * @throws ForbiddenException        if the caller doesn't own the course
     */
    @Transactional
    public void deleteCourse(Long courseId, String instructorEmail) {
        Course course = loadCourseWithDetails(courseId);
        verifyOwnership(course, instructorEmail, "delete");

        courseRepository.delete(course);
        log.info("Course deleted: id={} by {}", courseId, instructorEmail);
    }

    // ── Module operations ────────────────────────────────────────────────────

    /**
     * Adds a new module to an existing course.
     * The module is appended after any existing modules (orderIndex = current count).
     *
     * @param courseId        the course to add the module to
     * @param request         module title and description
     * @param instructorEmail the authenticated caller's email
     * @return the created module as a {@link ModuleResponse}
     * @throws ResourceNotFoundException if the course doesn't exist
     * @throws ForbiddenException        if the caller doesn't own the course
     */
    @Transactional
    public ModuleResponse addModule(Long courseId, ModuleRequest request, String instructorEmail) {
        Course course = loadCourseWithDetails(courseId);
        verifyOwnership(course, instructorEmail, "add modules to");

        int nextOrder = course.getModules().size();

        CourseModule module = CourseModule.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .orderIndex(nextOrder)
                .course(course)
                .build();

        CourseModule saved = courseModuleRepository.save(module);
        log.info("Module added to course {}: '{}'", courseId, saved.getTitle());
        return ModuleResponse.from(saved);
    }

    // ── Lesson operations ────────────────────────────────────────────────────

    /**
     * Adds a new lesson to an existing module.
     * The lesson is appended after any existing lessons (orderIndex = current count).
     *
     * @param moduleId        the module to add the lesson to
     * @param request         lesson title and content
     * @param instructorEmail the authenticated caller's email
     * @return the created lesson as a {@link LessonResponse}
     * @throws ResourceNotFoundException if the module doesn't exist
     * @throws ForbiddenException        if the caller doesn't own the parent course
     */
    @Transactional
    public LessonResponse addLesson(Long moduleId, LessonRequest request, String instructorEmail) {
        // Load module with its course + instructor to check ownership without extra queries
        CourseModule module = courseModuleRepository.findByIdWithCourseAndInstructor(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Module not found with id: " + moduleId));

        verifyOwnership(module.getCourse(), instructorEmail, "add lessons to");

        int nextOrder = module.getLessons().size();

        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .lessonType(request.getLessonType() != null ? request.getLessonType() : LessonType.TEXT)
                .mediaUrl(request.getMediaUrl())
                .videoType(request.getVideoType())
                .orderIndex(nextOrder)
                .module(module)
                .build();


        Lesson saved = lessonRepository.save(lesson);
        log.info("Lesson added to module {}: '{}'", moduleId, saved.getTitle());
        return LessonResponse.from(saved);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Loads a user by email, throwing {@link ResourceNotFoundException} if absent.
     */
    private User loadUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    /**
     * Loads a course with its full detail tree, throwing {@link ResourceNotFoundException}
     * if absent.
     */
    private Course loadCourseWithDetails(Long courseId) {
        return courseRepository.findByIdWithDetails(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + courseId));
    }

    /**
     * Verifies that the given email matches the course owner's email.
     *
     * @param course    the course to check ownership of
     * @param email     the caller's email
     * @param action    human-readable action name used in the error message (e.g. "update")
     * @throws ForbiddenException if the caller is not the owner
     */
    private void verifyOwnership(Course course, String email, String action) {
        if (!course.getInstructor().getEmail().equals(email)) {
            throw new ForbiddenException(
                    "You are not authorised to " + action + " this course");
        }
    }
}
