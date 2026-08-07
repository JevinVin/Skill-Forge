package com.learningplatform.progress.repository;

import com.learningplatform.progress.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Data access layer for {@link Progress} entities.
 */
public interface ProgressRepository extends JpaRepository<Progress, Long> {

    List<Progress> findByUserId(Long userId);

    List<Progress> findByUserIdAndCourseId(Long userId, Long courseId);

    Optional<Progress> findByUserIdAndLessonId(Long userId, Long lessonId);

    long countByUserId(Long userId);

    long countByUserIdAndCourseId(Long userId, Long courseId);

    boolean existsByUserIdAndLessonId(Long userId, Long lessonId);
}
