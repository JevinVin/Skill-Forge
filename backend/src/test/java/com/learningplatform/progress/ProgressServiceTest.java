package com.learningplatform.progress;

import com.learningplatform.auth.model.Role;
import com.learningplatform.auth.model.User;
import com.learningplatform.auth.repository.UserRepository;
import com.learningplatform.course.model.Course;
import com.learningplatform.course.model.CourseModule;
import com.learningplatform.course.model.Lesson;
import com.learningplatform.course.repository.CourseRepository;
import com.learningplatform.course.repository.LessonRepository;
import com.learningplatform.progress.dto.DashboardStatsResponse;
import com.learningplatform.progress.model.Progress;
import com.learningplatform.progress.repository.ProgressRepository;
import com.learningplatform.progress.service.ProgressService;
import com.learningplatform.quiz.repository.QuizRepository;
import com.learningplatform.quiz.repository.QuizSubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProgressServiceTest {

    @Mock
    private ProgressRepository progressRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private LessonRepository lessonRepository;
    @Mock
    private QuizSubmissionRepository quizSubmissionRepository;
    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private ProgressService progressService;

    private User student;
    private Course course;
    private Lesson lesson;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(1L)
                .email("student@example.com")
                .fullName("Test Student")
                .role(Role.STUDENT)
                .build();

        course = Course.builder()
                .id(10L)
                .title("Java Basics")
                .instructor(student)
                .build();

        Lesson l = Lesson.builder().id(100L).title("Syntax").build();
        CourseModule m = CourseModule.builder().id(50L).lessons(List.of(l)).build();
        course.setModules(List.of(m));

        lesson = l;
    }

    @Test
    @DisplayName("markLessonComplete - saves progress when lesson is incomplete")
    void markLessonComplete_SavesProgress() {
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(lessonRepository.findById(100L)).thenReturn(Optional.of(lesson));
        when(progressRepository.findByUserIdAndLessonId(1L, 100L)).thenReturn(Optional.empty());

        progressService.markLessonComplete(10L, 100L, "student@example.com");

        verify(progressRepository, times(1)).save(any(Progress.class));
    }

    @Test
    @DisplayName("markLessonComplete - keeps progress permanent when lesson is already complete")
    void markLessonComplete_KeepsProgressPermanent() {
        Progress existingProgress = Progress.builder().id(1L).user(student).course(course).lesson(lesson).build();
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(lessonRepository.findById(100L)).thenReturn(Optional.of(lesson));
        when(progressRepository.findByUserIdAndLessonId(1L, 100L)).thenReturn(Optional.of(existingProgress));

        progressService.markLessonComplete(10L, 100L, "student@example.com");

        verify(progressRepository, never()).delete(any(Progress.class));
    }


    @Test
    @DisplayName("getDashboardStats - computes metrics and badges for student")
    void getDashboardStats_ReturnsStudentStats() {
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));
        when(courseRepository.findAll()).thenReturn(List.of(course));
        when(progressRepository.findByUserId(1L)).thenReturn(Collections.emptyList());
        when(quizSubmissionRepository.findByStudentId(1L)).thenReturn(Collections.emptyList());

        DashboardStatsResponse stats = progressService.getDashboardStats("student@example.com");

        assertThat(stats.getTotalCompletedLessons()).isZero();
        assertThat(stats.getBadges()).hasSize(4);
    }
}
