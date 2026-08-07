package com.learningplatform.course.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * The smallest unit of course content — a single piece of study material
 * (text, markdown, embedded video URL, etc.) belonging to a
 * {@link CourseModule}.
 *
 * <p>
 * The {@code orderIndex} field controls the display order within its module.
 */
@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    /** The lesson body — stored as TEXT to accommodate long markdown content. */
    @Column(columnDefinition = "TEXT")
    private String content;

    /** Zero-based position of this lesson within its module. */
    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "lesson_type", nullable = false)
    @Builder.Default
    private LessonType lessonType = LessonType.TEXT;

    @Column(name = "media_url", columnDefinition = "TEXT")
    private String mediaUrl;

    @Column(name = "video_type")
    private String videoType;


    /** The module this lesson belongs to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private CourseModule module;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
