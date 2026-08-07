package com.learningplatform.course.repository;

import com.learningplatform.course.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Data access layer for {@link Lesson} entities.
 *
 * <p>Extends {@link JpaRepository} — standard CRUD operations are sufficient
 * for lessons in the current MVP scope.
 */
public interface LessonRepository extends JpaRepository<Lesson, Long> {
}
