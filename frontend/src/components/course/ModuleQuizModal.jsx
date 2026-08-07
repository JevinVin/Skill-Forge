import React, { useState, useEffect } from 'react';
import { fetchModuleQuiz, submitModuleQuiz, createModuleQuiz, importModuleQuizFile } from '../../api/quizApi';
import { Card, Button, Input, LoadingSkeleton } from '../common';

/**
 * ModuleQuizModal component — handles per-module quiz taking, instructor quiz creation/import,
 * and 100% accuracy module completion evaluation.
 */
const ModuleQuizModal = ({ moduleId, moduleTitle, isOwner, onClose, onModuleCompleted }) => {
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Quiz taking states
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Instructor creation / import states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const loadQuiz = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchModuleQuiz(moduleId);
      setQuiz(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setQuiz(null);
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load module quiz.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [moduleId]);

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quiz || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitModuleQuiz(moduleId, selectedAnswers);
      setSubmissionResult(result);
      if (result.percentage >= 100.0) {
        onModuleCompleted?.(moduleId);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to submit module quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    setIsCreating(true);
    try {
      const created = await createModuleQuiz(moduleId, { title: quizTitle.trim() });
      setQuiz(created);
      setShowCreateModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create module quiz');
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return;

    setIsImporting(true);
    try {
      const updated = await importModuleQuizFile(moduleId, importFile);
      setQuiz(updated);
      setImportFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to import quiz file');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000,
    }}>
      <Card style={{
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        position: 'relative',
      }}>
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '1.25rem',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Module Quiz: {moduleTitle}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
          ⚠️ You must achieve <strong style={{ color: 'var(--accent-light)' }}>100% accuracy</strong> on this quiz to complete the module!
        </p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '16px',
            color: 'var(--color-danger)',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <LoadingSkeleton width="100%" height="24px" />
            <LoadingSkeleton width="100%" height="16px" />
          </div>
        ) : submissionResult ? (
          /* Result Screen */
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '12px',
            }}>
              {submissionResult.percentage >= 100.0 ? '🎉' : '🎯'}
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {submissionResult.percentage >= 100.0 ? 'Perfect Score! 100%' : `Score: ${Math.round(submissionResult.percentage)}%`}
            </h3>

            <p style={{
              fontSize: '0.95rem',
              color: submissionResult.percentage >= 100.0 ? 'var(--color-success)' : 'var(--color-danger)',
              fontWeight: 600,
              marginBottom: '20px',
            }}>
              {submissionResult.percentage >= 100.0
                ? 'Module Completed Successfully! ✓'
                : '100% accuracy is required to complete this module. Please retake the quiz!'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {submissionResult.percentage < 100.0 && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setSubmissionResult(null);
                    setSelectedAnswers({});
                  }}
                >
                  Retake Module Quiz
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Close Window
              </Button>
            </div>
          </div>
        ) : !quiz ? (
          /* No Module Quiz Present */
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              No quiz has been added to this module yet.
            </p>
            {isOwner && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '400px', margin: '0 auto' }}>
                <form onSubmit={handleCreateSubmit} style={{ display: 'flex', gap: '10px' }}>
                  <Input
                    placeholder="Quiz Title (e.g. Module 1 Check)"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                  />
                  <Button type="submit" variant="primary" isLoading={isCreating}>
                    Create
                  </Button>
                </form>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Or Quick Import CSV / JSON Quiz File:
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="file"
                      accept=".csv, .json"
                      onChange={(e) => setImportFile(e.target.files[0])}
                      style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}
                    />
                    <Button type="button" variant="secondary" size="sm" isLoading={isImporting} onClick={handleImportSubmit}>
                      Import
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Active Module Quiz Questions */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isOwner && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Instructor Quick Import:</span>
                <input
                  type="file"
                  accept=".csv, .json"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}
                />
                <Button type="button" variant="secondary" size="sm" isLoading={isImporting} onClick={handleImportSubmit}>
                  Upload MCQs
                </Button>
              </div>
            )}

            {quiz.questions?.map((q, idx) => (
              <div key={q.id || idx} style={{ borderBottom: '1px solid var(--border-color)', pb: '16px', pb: '16px' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  {idx + 1}. {q.text}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.options?.map((opt) => {
                    const isSelected = selectedAnswers[q.id] === opt.id;
                    return (
                      <label
                        key={opt.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name={`mod-q-${q.id}`}
                          checked={isSelected}
                          onChange={() => handleSelectOption(q.id, opt.id)}
                          style={{ accentColor: 'var(--accent-primary)' }}
                        />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {opt.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Submit Answers
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ModuleQuizModal;
