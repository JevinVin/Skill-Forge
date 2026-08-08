package com.learningplatform.progress;

import com.learningplatform.auth.model.User;
import com.learningplatform.auth.repository.UserRepository;
import com.learningplatform.course.model.Course;
import com.learningplatform.course.model.CourseModule;
import com.learningplatform.course.repository.CourseRepository;
import com.learningplatform.progress.dto.CertificateResponse;
import com.learningplatform.progress.service.CertificateService;
import com.learningplatform.progress.service.ProgressService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CertificateServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProgressService progressService;

    @InjectMocks
    private CertificateService certificateService;

    private User student;
    private Course course;
    private CourseModule module1;

    @BeforeEach
    void setUp() {
        student = User.builder().id(10L).fullName("JevinVin").email("jevin@example.com").build();
        module1 = CourseModule.builder().id(100L).title("Module 1").build();
        course = Course.builder().id(50L).title("Full Stack Development").modules(List.of(module1)).build();
    }


    @Test
    @DisplayName("getCertificate - returns eligible certificate when 100% completed")
    void getCertificate_ReturnsEligibleCertificate_WhenCompleted() {
        when(userRepository.findByEmail("jevin@example.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(50L)).thenReturn(Optional.of(course));
        when(progressService.isModuleCompleted(eq(100L), eq(10L))).thenReturn(true);

        CertificateResponse response = certificateService.getCertificate(50L, "jevin@example.com");

        assertThat(response.isEligible()).isTrue();
        assertThat(response.getStudentName()).isEqualTo("JevinVin");
        assertThat(response.getCertificateId()).startsWith("SF-CERT-");
        assertThat(response.getCompletionPercentage()).isEqualTo(100.0);
    }

    @Test
    @DisplayName("getCertificate - returns locked certificate response when under 100%")
    void getCertificate_ReturnsLockedCertificate_WhenUnder100() {
        when(userRepository.findByEmail("jevin@example.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(50L)).thenReturn(Optional.of(course));
        when(progressService.isModuleCompleted(eq(100L), eq(10L))).thenReturn(false);

        CertificateResponse response = certificateService.getCertificate(50L, "jevin@example.com");

        assertThat(response.isEligible()).isFalse();
        assertThat(response.getMessage()).contains("Certificate locked");
    }
}
