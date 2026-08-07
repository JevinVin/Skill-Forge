package com.learningplatform.course.model;

import com.learningplatform.auth.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a course on the platform.
 *
 * <p>A course is owned by an {@link User instructor}. Its content is organised
 * into an ordered list of {@link CourseModule modules}, each of which contains
 * an ordered list of {@link Lesson lessons}.
 *
 * <p>Deleting a course cascades to all its modules and lessons ({@code CascadeType.ALL}
 * + {@code orphanRemoval = true}).
 */
@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    /** Full course description — stored as TEXT to allow long markdown content. */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** The instructor who created and owns this course. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    /**
     * Ordered list of modules belonging to this course.
     * Initialised to an empty list so the builder and no-args constructor
     * both produce a non-null collection.
     */
    @Builder.Default
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<CourseModule> modules = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
