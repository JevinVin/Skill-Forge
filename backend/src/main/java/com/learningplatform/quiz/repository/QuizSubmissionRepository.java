package com.learningplatform.quiz.repository;

import com.learningplatform.quiz.model.QuizSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Data access layer for {@link QuizSubmission} entities.
 *
 * <p>Standard CRUD is sufficient for the MVP — submissions are write-once.
 */
public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, Long> {

    java.util.List<QuizSubmission> findByStudentId(Long studentId);
}

