package com.learningplatform.quiz.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * A single question within a {@link Quiz}.
 *
 * <p>Each question has an ordered list of {@link QuizOption options}, exactly
 * one of which should be marked as correct.
 *
 * <p>The {@code orderIndex} field controls the display order within the quiz.
 */
@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The question body — stored as TEXT to support long or formatted questions. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    /** Zero-based position of this question within its quiz. */
    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    /** The quiz this question belongs to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    /**
     * Answer options for this question.
     * Initialised to an empty list to ensure non-null collection from the builder.
     */
    @Builder.Default
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<QuizOption> options = new ArrayList<>();
}
