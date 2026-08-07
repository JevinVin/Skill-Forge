package com.learningplatform.course.repository;

import com.learningplatform.course.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Data access layer for {@link Course} entities.
 *
 * <p>Custom JPQL queries use {@code JOIN FETCH} to load associated data eagerly
 * within the same query, preventing N+1 select problems when the service converts
 * entities to DTOs inside a transaction.
 */
public interface CourseRepository extends JpaRepository<Course, Long> {

    /**
     * Fetches all courses with their instructors loaded in a single query.
     * Used by the list endpoint — modules/lessons are intentionally excluded
     * to keep the payload lightweight.
     *
     * @return all courses ordered by creation date (newest first)
     */
    @Query("SELECT c FROM Course c JOIN FETCH c.instructor ORDER BY c.createdAt DESC")
    List<Course> findAllWithInstructor();

    /**
     * Fetches a single course with its full content tree (instructor + modules + lessons)
     * loaded in a single query using {@code DISTINCT} to de-duplicate the join result.
     * Used by the course detail endpoint.
     *
     * @param id the course ID
     * @return the course with all nested data, or empty if not found
     */
    @Query("""
            SELECT DISTINCT c FROM Course c
            LEFT JOIN FETCH c.instructor
            LEFT JOIN FETCH c.modules
            WHERE c.id = :id
            """)
    Optional<Course> findByIdWithDetails(@Param("id") Long id);
}
