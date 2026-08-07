package com.learningplatform.course;

import com.learningplatform.auth.model.Role;
import com.learningplatform.auth.model.User;
import com.learningplatform.auth.repository.UserRepository;
import com.learningplatform.course.dto.*;
import com.learningplatform.course.model.Course;
import com.learningplatform.course.model.CourseModule;
import com.learningplatform.course.model.Lesson;
import com.learningplatform.course.repository.CourseModuleRepository;
import com.learningplatform.course.repository.CourseRepository;
import com.learningplatform.course.repository.LessonRepository;
import com.learningplatform.course.service.CourseService;
import com.learningplatform.shared.exception.ForbiddenException;
import com.learningplatform.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link CourseService}.
 *
 * <p>Uses Mockito only — no Spring context or database required.
 *
 * <p>Coverage:
 * <ul>
 *   <li>getAllCourses: returns mapped list</li>
 *   <li>getCourseById: success, not found</li>
 *   <li>createCourse: success, non-instructor blocked</li>
 *   <li>updateCourse: success, non-owner blocked</li>
 *   <li>deleteCourse: success, non-owner blocked</li>
 *   <li>addModule: success, non-owner blocked</li>
 *   <li>addLesson: success, non-owner blocked</li>
 * </ul>
 */
@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock private CourseRepository courseRepository;
    @Mock private CourseModuleRepository courseModuleRepository;
    @Mock private LessonRepository lessonRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private CourseService courseService;

    // ── getAllCourses ─────────────────────────────────────────────────────────

    @Test
    void getAllCourses_returnsMappedList() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, "Java Basics", instructor);

        when(courseRepository.findAllWithInstructor()).thenReturn(List.of(course));

        List<CourseListItemResponse> result = courseService.getAllCourses();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Java Basics");
        assertThat(result.get(0).getInstructorName()).isEqualTo("Alice Smith");
    }

    // ── getCourseById ─────────────────────────────────────────────────────────

    @Test
    void getCourseById_whenExists_returnsCourseResponse() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, "Java Basics", instructor);

        when(courseRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(course));

        CourseResponse response = courseService.getCourseById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("Java Basics");
        assertThat(response.getInstructorEmail()).isEqualTo("alice@example.com");
    }

    @Test
    void getCourseById_whenNotFound_throwsResourceNotFoundException() {
        when(courseRepository.findByIdWithDetails(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseService.getCourseById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ── createCourse ──────────────────────────────────────────────────────────

    @Test
    void createCourse_byInstructor_savesAndReturnsResponse() {
        User instructor = buildInstructor("alice@example.com");
        CourseRequest request = buildCourseRequest("Spring Boot Mastery");
        Course saved = buildCourse(1L, "Spring Boot Mastery", instructor);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(instructor));
        when(courseRepository.save(any(Course.class))).thenReturn(saved);

        CourseResponse response = courseService.createCourse(request, "alice@example.com");

        assertThat(response.getTitle()).isEqualTo("Spring Boot Mastery");
        verify(courseRepository).save(any(Course.class));
    }

    @Test
    void createCourse_byStudent_throwsForbiddenException() {
        User student = buildUser("bob@example.com", Role.STUDENT);

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(student));

        assertThatThrownBy(() ->
                courseService.createCourse(buildCourseRequest("Illegal Course"), "bob@example.com"))
                .isInstanceOf(ForbiddenException.class);
    }

    // ── updateCourse ──────────────────────────────────────────────────────────

    @Test
    void updateCourse_byOwner_returnsUpdatedResponse() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, "Old Title", instructor);
        CourseRequest request = buildCourseRequest("New Title");

        when(courseRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(course));
        when(courseRepository.save(any(Course.class))).thenAnswer(inv -> inv.getArgument(0));

        CourseResponse response = courseService.updateCourse(1L, request, "alice@example.com");

        assertThat(response.getTitle()).isEqualTo("New Title");
    }

    @Test
    void updateCourse_byNonOwner_throwsForbiddenException() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, "Java Basics", instructor);

        when(courseRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(course));

        assertThatThrownBy(() ->
                courseService.updateCourse(1L, buildCourseRequest("Hijacked"), "hacker@example.com"))
                .isInstanceOf(ForbiddenException.class);
    }

    // ── deleteCourse ──────────────────────────────────────────────────────────

    @Test
    void deleteCourse_byOwner_deletesCourse() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, "Java Basics", instructor);

        when(courseRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(course));

        courseService.deleteCourse(1L, "alice@example.com");

        verify(courseRepository).delete(course);
    }

    @Test
    void deleteCourse_byNonOwner_throwsForbiddenException() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, "Java Basics", instructor);

        when(courseRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(course));

        assertThatThrownBy(() ->
                courseService.deleteCourse(1L, "hacker@example.com"))
                .isInstanceOf(ForbiddenException.class);
    }

    // ── addModule ─────────────────────────────────────────────────────────────

    @Test
    void addModule_byOwner_savesAndReturnsModuleResponse() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, "Java Basics", instructor);
        ModuleRequest request = new ModuleRequest();
        request.setTitle("Introduction");

        CourseModule saved = CourseModule.builder()
                .id(10L).title("Introduction").orderIndex(0).course(course)
                .lessons(new ArrayList<>()).build();

        when(courseRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(course));
        when(courseModuleRepository.save(any(CourseModule.class))).thenReturn(saved);

        ModuleResponse response = courseService.addModule(1L, request, "alice@example.com");

        assertThat(response.getTitle()).isEqualTo("Introduction");
        assertThat(response.getOrderIndex()).isZero(); // first module → index 0
    }

    @Test
    void addModule_byNonOwner_throwsForbiddenException() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, "Java Basics", instructor);

        when(courseRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(course));

        ModuleRequest request = new ModuleRequest();
        request.setTitle("Sneaky Module");

        assertThatThrownBy(() ->
                courseService.addModule(1L, request, "hacker@example.com"))
                .isInstanceOf(ForbiddenException.class);
    }

    // ── addLesson ─────────────────────────────────────────────────────────────

    @Test
    void addLesson_byOwner_savesAndReturnsLessonResponse() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, "Java Basics", instructor);
        CourseModule module = CourseModule.builder()
                .id(10L).title("Intro").orderIndex(0).course(course)
                .lessons(new ArrayList<>()).build();

        LessonRequest request = new LessonRequest();
        request.setTitle("What is Java?");
        request.setContent("Java is a language...");

        Lesson saved = Lesson.builder()
                .id(100L).title("What is Java?").content("Java is a language...")
                .orderIndex(0).module(module).build();

        when(courseModuleRepository.findByIdWithCourseAndInstructor(10L))
                .thenReturn(Optional.of(module));
        when(lessonRepository.save(any(Lesson.class))).thenReturn(saved);

        LessonResponse response = courseService.addLesson(10L, request, "alice@example.com");

        assertThat(response.getTitle()).isEqualTo("What is Java?");
    }

    @Test
    void addLesson_byNonOwner_throwsForbiddenException() {
        User instructor = buildInstructor("alice@example.com");
        Course course = buildCourse(1L, "Java Basics", instructor);
        CourseModule module = CourseModule.builder()
                .id(10L).title("Intro").orderIndex(0).course(course)
                .lessons(new ArrayList<>()).build();

        when(courseModuleRepository.findByIdWithCourseAndInstructor(10L))
                .thenReturn(Optional.of(module));

        LessonRequest request = new LessonRequest();
        request.setTitle("Sneaky Lesson");

        assertThatThrownBy(() ->
                courseService.addLesson(10L, request, "hacker@example.com"))
                .isInstanceOf(ForbiddenException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private User buildInstructor(String email) {
        return buildUser(email, Role.INSTRUCTOR);
    }

    private User buildUser(String email, Role role) {
        return User.builder()
                .id(1L)
                .fullName("Alice Smith")
                .email(email)
                .passwordHash("hashed")
                .role(role)
                .build();
    }

    private Course buildCourse(Long id, String title, User instructor) {
        return Course.builder()
                .id(id)
                .title(title)
                .description("A test course")
                .instructor(instructor)
                .modules(new ArrayList<>())
                .build();
    }

    private CourseRequest buildCourseRequest(String title) {
        CourseRequest req = new CourseRequest();
        req.setTitle(title);
        req.setDescription("Test description");
        return req;
    }
}
