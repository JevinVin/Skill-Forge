package com.learningplatform.quiz.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * One answer choice for a {@link Question}.
 *
 * <p>Exactly one option per question should have {@code correct = true}.
 * The {@code correct} flag is intentionally excluded from the public
 * GET-quiz response DTOs — it is only revealed in the submission result.
 */
@Entity
@Table(name = "quiz_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The displayed text of this answer choice. */
    @Column(nullable = false)
    private String text;

    /**
     * Whether this option is the correct answer.
     * Not exposed in the quiz-fetch response — only used server-side during scoring
     * and revealed in the per-question result after submission.
     */
    @Column(nullable = false)
    private boolean correct;

    /** The question this option belongs to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
}
