package com.learningplatform.progress.service;

import com.learningplatform.auth.model.User;
import com.learningplatform.auth.repository.UserRepository;
import com.learningplatform.course.model.Course;
import com.learningplatform.course.repository.CourseRepository;
import com.learningplatform.progress.dto.CertificateResponse;
import com.learningplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service for verifying 100% course completion and issuing official
 * Skillforge Certificates of Completion.
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
     * Enforces the 100% completion rule.
     */
    @Transactional(readOnly = true)
    public CertificateResponse getCertificate(Long courseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        int totalModules = course.getModules() != null ? course.getModules().size() : 0;
        int completedModules = 0;

        if (totalModules > 0) {
            for (var mod : course.getModules()) {
                if (progressService.isModuleCompleted(mod.getId(), user.getId())) {
                    completedModules++;
                }
            }
        }

        double percentage = totalModules > 0 ? ((double) completedModules / totalModules) * 100.0 : 100.0;
        boolean eligible = percentage >= 100.0;

        if (!eligible) {
            return CertificateResponse.builder()
                    .eligible(false)
                    .courseTitle(course.getTitle())
                    .studentName(user.getFullName() != null ? user.getFullName() : user.getEmail())
                    .completionPercentage(percentage)
                    .message("Certificate locked. You must complete 100% of modules and pass quizzes with 100% accuracy to unlock your certificate.")
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
