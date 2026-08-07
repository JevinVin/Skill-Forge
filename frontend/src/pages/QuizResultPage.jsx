import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/common';

/**
 * QuizResultPage — displays self-contained quiz results, score percentage,
 * and a per-question breakdown comparing student choices to correct answers.
 *
 * @param {Object} props
 * @param {Object} props.result - Submission result payload from backend
 * @param {number} props.result.score
 * @param {number} props.result.totalQuestions
 * @param {number} props.result.percentage
 * @param {Array} props.result.questionResults
 * @param {number|string} props.courseId
 * @param {() => void} props.onRetake - Callback to reset quiz state and retake
 */
export const QuizResultPage = ({ result, courseId, onRetake }) => {
  const isPassed = result.percentage >= 70;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Score Summary Header */}
      <Card style={{ padding: '36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 700,
          backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: isPassed ? 'var(--color-success)' : 'var(--color-danger)',
          border: isPassed ? '1px solid var(--color-success)' : '1px solid var(--color-danger)',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {isPassed ? 'Passed' : 'Needs Review'}
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {result.score} <span style={{ fontSize: '1.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {result.totalQuestions}</span>
        </h1>

        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-light)', marginBottom: '24px' }}>
          {result.percentage.toFixed(1)}% Final Score
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={onRetake}>
            Retake Quiz
          </Button>
          <Link to={`/courses/${courseId}`} style={{ textDecoration: 'none' }}>
            <Button variant="outline">
              Back to Course
            </Button>
          </Link>
        </div>
      </Card>

      {/* Per-Question Breakdown */}
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Detailed Breakdown
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {result.questionResults?.map((qRes, idx) => (
            <Card
              key={qRes.questionId || idx}
              style={{
                padding: '20px 24px',
                borderLeft: qRes.correct
                  ? '4px solid var(--color-success)'
                  : '4px solid var(--color-danger)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1, paddingRight: '12px' }}>
                  {idx + 1}. {qRes.questionText}
                </h3>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: qRes.correct ? 'var(--color-success)' : 'var(--color-danger)',
                }}>
                  {qRes.correct ? '✓ Correct' : '✕ Incorrect'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                {/* Student's Pick */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: '120px' }}>Your Answer:</span>
                  <span style={{
                    color: qRes.correct ? 'var(--color-success)' : 'var(--color-danger)',
                    fontWeight: 500,
                  }}>
                    {qRes.selectedOptionText || '(Unanswered)'}
                  </span>
                </div>

                {/* Correct Answer */}
                {!qRes.correct && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', minWidth: '120px' }}>Correct Answer:</span>
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                      {qRes.correctOptionText || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
