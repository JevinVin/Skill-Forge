package com.learningplatform.progress.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Payload returned for a student's Certificate of Completion.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateResponse {

    private boolean eligible;
    private String certificateId; // e.g. SF-CERT-8F3A29
    private String studentName;
    private String courseTitle;
    private String instructorName;
    private double completionPercentage;
    private LocalDateTime issueDate;
    private String message;
}
