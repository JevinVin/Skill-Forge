package com.learningplatform.progress.service;

import com.learningplatform.auth.model.User;
import com.learningplatform.auth.repository.UserRepository;
import com.learningplatform.course.model.Course;
import com.learningplatform.course.repository.CourseRepository;
import com.learningplatform.progress.dto.CertificateResponse;
import com.learningplatform.progress.dto.CourseProgressDetailResponse;
import com.learningplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service for verifying 100% course completion and issuing official
 * Skillforge Certificates of Completion.
 * Strict Rule: Certificate unlocks ONLY when all lessons are completed AND
 * all quizzes (module & course quizzes) are passed with 100% accuracy.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ProgressService progressService;

    /**
     * Issues or verifies a Certificate of Completion for a student on a specific course.
     * Enforces strict 100% completion rule (all lessons + 100% accuracy on all quizzes).
     */
    @Transactional(readOnly = true)
    public CertificateResponse getCertificate(Long courseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        CourseProgressDetailResponse progressDetails = progressService.getCourseProgressDetails(courseId, userEmail);

        boolean eligible = progressDetails.getOverallProgressPercentage() >= 100
                && progressDetails.getCompletedItemsCount() == progressDetails.getTotalItemsCount()
                && progressDetails.getTotalItemsCount() > 0;

        if (!eligible) {
            return CertificateResponse.builder()
                    .eligible(false)
                    .courseTitle(course.getTitle())
                    .studentName(user.getFullName() != null ? user.getFullName() : user.getEmail())
                    .completionPercentage((double) progressDetails.getOverallProgressPercentage())
                    .message("Certificate locked. You must complete 100% of lessons AND achieve 100% score on all quizzes to unlock your certificate.")
                    .build();
        }

        // Generate unique certificate hash based on courseId + userId
        String certHash = Integer.toHexString((courseId + "-" + user.getId() + "-SKILLFORGE-CERT").hashCode()).toUpperCase();
        String certId = "SF-CERT-" + certHash;
        String studentName = user.getFullName() != null ? user.getFullName() : user.getEmail();
        String instructorName = course.getInstructor() != null ? course.getInstructor().getFullName() : "Skillforge Instructor";

        log.info("Certificate issued for user '{}' on course '{}': {}", userEmail, course.getTitle(), certId);

        return CertificateResponse.builder()
                .eligible(true)
                .certificateId(certId)
                .studentName(studentName)
                .courseTitle(course.getTitle())
                .instructorName(instructorName)
                .completionPercentage(100.0)
                .issueDate(LocalDateTime.now())
                .message("Congratulations! Your Certificate of Completion has been officially generated.")
                .build();
    }
}
