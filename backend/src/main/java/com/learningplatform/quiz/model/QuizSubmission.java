package com.learningplatform.quiz.model;

import com.learningplatform.auth.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Records the result of a student's quiz attempt.
 *
 * <p>The selected answers are not persisted individually — only the final
 * score, total, and percentage are stored. The per-question breakdown is
 * computed and returned in the response at submission time but not saved
 * (sufficient for the MVP; per-answer storage can be added later).
 */
@Entity
@Table(name = "quiz_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    /** Number of correct answers in this attempt. */
    @Column(nullable = false)
    private int score;

    /** Total number of questions in the quiz at time of submission. */
    @Column(name = "total_questions", nullable = false)
    private int totalQuestions;

    /** {@code score / totalQuestions * 100}, rounded to two decimal places. */
    @Column(nullable = false)
    private double percentage;

    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;
}
