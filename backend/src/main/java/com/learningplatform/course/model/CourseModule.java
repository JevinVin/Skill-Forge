package com.learningplatform.course.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A logical section of a {@link Course}, containing an ordered list of {@link Lesson lessons}.
 *
 * <p>Named {@code CourseModule} (rather than {@code Module}) to avoid shadowing
 * {@code java.lang.Module} which is imported automatically in Java 9+.
 *
 * <p>The {@code orderIndex} field controls the display order within a course.
 * New modules are appended to the end (index = current module count).
 */
@Entity
@Table(name = "modules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Zero-based position of this module within its course. */
    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    /** The course this module belongs to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * Ordered list of lessons belonging to this module.
     * Initialised to an empty list by default (see {@code @Builder.Default}).
     */
    @Builder.Default
    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<Lesson> lessons = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
