import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import QuizResultPage from './QuizResultPage';
import { fetchQuizByCourseId, submitQuiz, createQuiz, addQuestion, updateQuestion, deleteQuiz, deleteQuestion, importQuizFile } from '../api/quizApi';
import { fetchCourseById } from '../api/courseApi';
import { Card, Button, Input, LoadingSkeleton } from '../components/common';
import { useAuth } from '../context/AuthContext';

/**
 * QuizPage component — handles interactive quiz-taking, answer selection,
 * submission to backend scoring, results rendering, instructor question management (add/edit/delete),
 * and bulk MCQ import from CSV/JSON files.
 */
const QuizPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);

  // Quiz-taking state
  const [selectedAnswers, setSelectedAnswers] = useState({}); // questionId -> selectedOptionId
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Instructor quiz management states
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  // Instructor question modal state (handles both Add & Edit)
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null); // null = Add, number = Edit
  const [questionText, setQuestionText] = useState('');
  const [optionTexts, setOptionTexts] = useState(['', '', '', '']);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [modalError, setModalError] = useState('');

  // Bulk File Import modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const courseData = await fetchCourseById(id);
      setCourse(courseData);

      try {
        const quizData = await fetchQuizByCourseId(id);
        setQuiz(quizData);
      } catch (err) {
        if (err.response?.status === 404) {
          setQuiz(null);
        } else {
          const msg = err.response?.data?.error
            || err.response?.data?.message
            || (err.message === 'Network Error' ? 'Cannot connect to backend server at http://localhost:8080/api.' : err.message);
          setError(msg);
        }
      }
    } catch (err) {
      const message = err.response?.data?.error
        || err.response?.data?.message
        || (err.message === 'Network Error' ? 'Cannot connect to backend server at http://localhost:8080/api.' : err.message)
        || 'Failed to load course details.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const isOwner = Boolean(
    user && (
      user.role === 'INSTRUCTOR' ||
      (user.id && course?.instructorId && user.id === course.instructorId) ||
      (user.email && course?.instructorEmail && user.email.toLowerCase() === course.instructorEmail.toLowerCase())
    )
  );

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!quiz || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitQuiz(id, selectedAnswers);
      setSubmissionResult(result);
    } catch (err) {
      const message = err.response?.data?.error
        || err.response?.data?.message
        || 'Failed to submit quiz. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateQuizSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!quizTitle.trim()) {
      setModalError('Quiz title is required');
      return;
    }

    setIsCreatingQuiz(true);
    try {
      const newQuiz = await createQuiz(id, {
        title: quizTitle.trim(),
        description: quizDescription.trim(),
      });
      setQuiz(newQuiz);
      setShowCreateQuizModal(false);
      setQuizTitle('');
      setQuizDescription('');
    } catch (err) {
      setModalError(err.response?.data?.error || err.response?.data?.message || 'Failed to create quiz.');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const openAddQuestionModal = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setOptionTexts(['', '', '', '']);
    setCorrectOptionIdx(0);
    setModalError('');
    setShowQuestionModal(true);
  };

  const openEditQuestionModal = (question) => {
    setEditingQuestionId(question.id);
    setQuestionText(question.text || '');

    const opts = (question.options || []).map((o) => o.text);
    while (opts.length < 4) opts.push('');
    setOptionTexts(opts.slice(0, 4));

    const correctIdx = (question.options || []).findIndex((o) => o.correct === true);
    setCorrectOptionIdx(correctIdx >= 0 ? correctIdx : 0);

    setModalError('');
    setShowQuestionModal(true);
  };

  const handleSaveQuestionSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!questionText.trim()) {
      setModalError('Question text is required');
      return;
    }

    const validOptions = optionTexts
      .map((t, idx) => ({ text: t.trim(), correct: idx === correctOptionIdx }))
      .filter((opt) => opt.text.length > 0);

    if (validOptions.length < 2) {
      setModalError('Please provide at least 2 answer choices');
      return;
    }

    setIsSavingQuestion(true);
    try {
      let updatedQuiz;
      if (editingQuestionId) {
        updatedQuiz = await updateQuestion(id, editingQuestionId, {
          text: questionText.trim(),
          options: validOptions,
        });
      } else {
        updatedQuiz = await addQuestion(id, {
          text: questionText.trim(),
          options: validOptions,
        });
      }

      setQuiz(updatedQuiz);
      setShowQuestionModal(false);
      setEditingQuestionId(null);
      setQuestionText('');
      setOptionTexts(['', '', '', '']);
      setCorrectOptionIdx(0);
    } catch (err) {
      setModalError(err.response?.data?.error || err.response?.data?.message || 'Failed to save question.');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setImportError('');
    if (!importFile) {
      setImportError('Please select a CSV or JSON file to upload.');
      return;
    }

    setIsImporting(true);
    try {
      const updatedQuiz = await importQuizFile(id, importFile);
      setQuiz(updatedQuiz);
      setShowImportModal(false);
      setImportFile(null);
    } catch (err) {
      setImportError(err.response?.data?.error || err.response?.data?.message || 'Failed to import quiz file.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: '850px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '20px' }}>
          <Link to={`/courses/${id}`} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            ← Back to Course Detail
          </Link>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '24px',
            color: 'var(--color-danger)',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '32px' }}>
            <LoadingSkeleton width="50%" height="28px" />
            <LoadingSkeleton width="100%" height="20px" />
            <LoadingSkeleton width="100%" height="20px" />
          </Card>
        ) : submissionResult ? (
          /* Render Quiz Result Screen when submitted */
          <QuizResultPage
            result={submissionResult}
            courseId={id}
            onRetake={() => {
              setSubmissionResult(null);
              setSelectedAnswers({});
            }}
          />
        ) : !quiz ? (
          /* No Quiz State */
          <Card style={{ padding: '60px 20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              No Quiz Created Yet
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
              {isOwner
                ? 'As the course instructor, you can create a quiz manually or import questions in bulk from a CSV/JSON file.'
                : 'The instructor has not added a quiz for this course yet.'}
            </p>
            {isOwner && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <Button variant="primary" onClick={() => { setModalError(''); setShowCreateQuizModal(true); }}>
                  + Create Quiz
                </Button>
                <Button variant="secondary" onClick={() => { setImportError(''); setImportFile(null); setShowImportModal(true); }}>
                  📁 Import Quiz (CSV / JSON)
                </Button>
              </div>
            )}
          </Card>
        ) : (
          /* Active Quiz Form */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {quiz.title || 'Course Quiz'}
                  </h1>
                  {quiz.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      {quiz.description}
                    </p>
                  )}
                </div>

                {isOwner && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button variant="secondary" size="sm" onClick={openAddQuestionModal}>
                      + Add Question
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setImportError(''); setImportFile(null); setShowImportModal(true); }}>
                      📁 Import CSV/JSON
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={deletingQuestionId === 'all'}
                      onClick={async () => {
                        if (!window.confirm('Are you sure you want to delete/reset this quiz? You can then create a fresh one.')) return;
                        setDeletingQuestionId('all');
                        setError('');
                        try {
                          await deleteQuiz(id);
                          setQuiz(null);
                          setSubmissionResult(null);
                        } catch (err) {
                          setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete quiz');
                        } finally {
                          setDeletingQuestionId(null);
                        }
                      }}
                    >
                      Delete Quiz
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {!quiz.questions || quiz.questions.length === 0 ? (
              <Card style={{ padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  This quiz currently has no questions.
                </p>
                {isOwner && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <Button variant="primary" size="sm" onClick={openAddQuestionModal}>
                      + Add First Question
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => { setImportError(''); setImportFile(null); setShowImportModal(true); }}>
                      📁 Import Questions
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <form onSubmit={handleSubmitQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {quiz.questions.map((question, qIdx) => (
                  <Card key={question.id || qIdx} style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                        {qIdx + 1}. {question.text}
                      </h3>

                      {isOwner && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => openEditQuestionModal(question)}
                            style={{
                              backgroundColor: 'transparent',
                              color: 'var(--accent-light)',
                              border: '1px solid var(--accent-primary)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '4px 10px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              fontWeight: 500,
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={deletingQuestionId === question.id}
                            onClick={async (e) => {
                              e.preventDefault();
                              if (!window.confirm(`Are you sure you want to delete question "${question.text}"?`)) return;
                              setDeletingQuestionId(question.id);
                              try {
                                const updated = await deleteQuestion(id, question.id);
                                setQuiz(updated);
                              } catch (err) {
                                alert(err.response?.data?.error || 'Failed to delete question');
                              } finally {
                                setDeletingQuestionId(null);
                              }
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              color: 'var(--color-danger)',
                              border: '1px solid var(--color-danger)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '4px 10px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              fontWeight: 500,
                            }}
                          >
                            {deletingQuestionId === question.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {question.options?.map((option) => {
                        const isSelected = selectedAnswers[question.id] === option.id;
                        return (
                          <label
                            key={option.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 16px',
                              borderRadius: 'var(--radius-md)',
                              border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                              backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)',
                            }}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              checked={isSelected}
                              onChange={() => handleSelectOption(question.id, option.id)}
                              style={{ accentColor: 'var(--accent-primary)', width: '18px', height: '18px' }}
                            />
                            <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                              {option.text}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </Card>
                ))}

                <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} fullWidth style={{ marginTop: '8px' }}>
                  Submit Quiz Answers
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Create Quiz Modal */}
        {showCreateQuizModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
            <Card style={{ width: '100%', maxWidth: '450px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Create Course Quiz
              </h3>

              {modalError && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '16px', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
                  {modalError}
                </div>
              )}

              <form onSubmit={handleCreateQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                  label="Quiz Title"
                  placeholder="e.g. Midterm Knowledge Check"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
                <Input
                  label="Description (Optional)"
                  placeholder="e.g. Test your understanding of modules 1-3"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Button type="button" variant="outline" onClick={() => setShowCreateQuizModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isCreatingQuiz}>
                    Create Quiz
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Add / Edit Question Modal */}
        {showQuestionModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
            <Card style={{ width: '100%', maxWidth: '550px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                {editingQuestionId ? 'Edit Quiz Question' : 'Add Quiz Question'}
              </h3>

              {modalError && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '16px', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSaveQuestionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                  label="Question Text"
                  placeholder="e.g. What is the default port for Spring Boot?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Answer Options (select the radio for the correct answer):
                  </label>
                  {optionTexts.map((optText, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="radio"
                        name="correct-option-choice"
                        checked={correctOptionIdx === idx}
                        onChange={() => setCorrectOptionIdx(idx)}
                        style={{ accentColor: 'var(--color-success)', width: '18px', height: '18px' }}
                      />
                      <Input
                        placeholder={`Option ${idx + 1}`}
                        value={optText}
                        onChange={(e) => {
                          const updated = [...optionTexts];
                          updated[idx] = e.target.value;
                          setOptionTexts(updated);
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <Button type="button" variant="outline" onClick={() => setShowQuestionModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isSavingQuestion}>
                    {editingQuestionId ? 'Save Changes' : 'Add Question'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Bulk Import Modal */}
        {showImportModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
            <Card style={{ width: '100%', maxWidth: '540px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                📁 Import Quiz Questions (CSV / JSON)
              </h3>

              {importError && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '16px', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
                  {importError}
                </div>
              )}

              <form onSubmit={handleImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Select .csv or .json File
                  </label>
                  <input
                    type="file"
                    accept=".csv, .json, application/json, text/csv"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed var(--accent-primary)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  />
                </div>

                {/* Sample format guidance */}
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Supported Format Examples:</p>
                  <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-light)', whiteSpace: 'pre-wrap' }}>
{`CSV format:
question,option1,option2,option3,option4,correct
Which component executes bytecode?,JDK,JVM,JRE,Javac,2`}
                  </pre>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <Button type="button" variant="outline" onClick={() => setShowImportModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isImporting}>
                    Import MCQs
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;
