package com.learningplatform.progress.controller;

import com.learningplatform.progress.dto.CertificateResponse;
import com.learningplatform.progress.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * REST controller for issuing and verifying Course Completion Certificates.
 * Endpoint: {@code GET /api/courses/{courseId}/certificate}
 */
@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    /**
     * Retrieves the Certificate of Completion for a student on a specific course.
     */
    @GetMapping("/{courseId}/certificate")
    public ResponseEntity<CertificateResponse> getCertificate(
            @PathVariable Long courseId,
            Principal principal) {
        return ResponseEntity.ok(certificateService.getCertificate(courseId, principal.getName()));
    }
}
