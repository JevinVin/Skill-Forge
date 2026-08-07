package com.learningplatform.quiz.repository;

import com.learningplatform.quiz.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Data access layer for {@link Quiz} entities.
 */
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    /**
     * Fetches the quiz for a given course with its full question and option tree
     * loaded in a single query — prevents N+1 selects when the service converts
     * to DTOs inside a transaction.
     *
     * @param courseId the ID of the owning course
     * @return the quiz with questions and options, or empty if no quiz exists for that course
     */
    @Query("""
            SELECT DISTINCT q FROM Quiz q
            LEFT JOIN FETCH q.questions
            WHERE q.course.id = :courseId
            """)
    Optional<Quiz> findByCourseIdWithDetails(@Param("courseId") Long courseId);

    @Query("""
            SELECT DISTINCT q FROM Quiz q
            LEFT JOIN FETCH q.questions
            WHERE q.module.id = :moduleId
            """)
    Optional<Quiz> findByModuleIdWithDetails(@Param("moduleId") Long moduleId);

    boolean existsByCourseId(Long courseId);

    boolean existsByModuleId(Long moduleId);
}

