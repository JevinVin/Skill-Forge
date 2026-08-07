package com.learningplatform.course.repository;

import com.learningplatform.course.model.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Data access layer for {@link CourseModule} entities.
 */
public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {

    /**
     * Fetches a module with its owning course and the course's instructor loaded.
     * Used when adding a lesson — the service needs to verify the caller owns the course
     * without triggering separate lazy-load queries.
     *
     * @param id the module ID
     * @return the module with course and instructor, or empty if not found
     */
    @Query("""
            SELECT m FROM CourseModule m
            JOIN FETCH m.course c
            JOIN FETCH c.instructor
            WHERE m.id = :id
            """)
    Optional<CourseModule> findByIdWithCourseAndInstructor(@Param("id") Long id);
}
