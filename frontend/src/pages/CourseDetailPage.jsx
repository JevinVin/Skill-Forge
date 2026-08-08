import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import PdfViewer from '../components/course/PdfViewer';
import VideoPlayer from '../components/course/VideoPlayer';
import ModuleQuizModal from '../components/course/ModuleQuizModal';
import CertificateModal from '../components/course/CertificateModal';
import AiTutorWidget from '../components/ai/AiTutorWidget';
import { fetchCourseById, deleteCourse, addModule, addLesson, uploadLessonMedia } from '../api/courseApi';

import { markLessonComplete, fetchDashboardStats, fetchCertificate } from '../api/progressApi';
import { Card, Button, Input, LoadingSkeleton } from '../components/common';
import { useAuth } from '../context/AuthContext';

/**
 * Detailed Course view page — updated layout matching modern course portals:
 * Primary content viewport on the left (Video / PDF / Text + Tabs & Metadata),
 * Course Content / Curriculum Sidebar on the right with left-aligned radio completion checkmarks.
 */
const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [completedModuleIds, setCompletedModuleIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedModules, setExpandedModules] = useState({});
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'notes', 'announcements'

  // Instructor action states
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeModuleModal, setActiveModuleModal] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleError, setModuleError] = useState('');
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);

  // Add Lesson Modal States
  const [activeLessonModalModuleId, setActiveLessonModalModuleId] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonType, setLessonType] = useState('TEXT'); // TEXT, PDF, VIDEO
  const [videoInputType, setVideoInputType] = useState('YOUTUBE'); // YOUTUBE, FILE
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [lessonError, setLessonError] = useState('');
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);

  // Module Quiz Modal State
  const [activeModuleQuiz, setActiveModuleQuiz] = useState(null); // { moduleId, title }

  // Certificate Modal State
  const [certificateData, setCertificateData] = useState(null);
  const [isFetchingCertificate, setIsFetchingCertificate] = useState(false);

  const handleClaimCertificate = async () => {
    setIsFetchingCertificate(true);
    try {
      const data = await fetchCertificate(id);
      if (!data.eligible) {
        alert(data.message || 'You must complete 100% of modules and pass quizzes with 100% accuracy to claim your certificate.');
      } else {
        setCertificateData(data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setIsFetchingCertificate(false);
    }
  };


  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchCourseById(id);
      setCourse(data);

      try {
        const stats = await fetchDashboardStats();
        // Load stats if available
      } catch (e) {
        // Ignore stats fetch error
      }

      if (data?.modules) {
        const initialExpanded = {};
        data.modules.forEach((mod) => {
          initialExpanded[mod.id] = true;
        });
        setExpandedModules(initialExpanded);

        // Select first lesson by default if available
        if (data.modules[0]?.lessons?.[0]) {
          setActiveLessonId(data.modules[0].lessons[0].id);
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

  const handleAutoCompleteLesson = async (lessonId) => {
    if (!lessonId || completedLessonIds.has(lessonId)) return;
    try {
      await markLessonComplete(id, lessonId);
      setCompletedLessonIds((prev) => new Set([...prev, lessonId]));
    } catch (e) {
      setCompletedLessonIds((prev) => new Set([...prev, lessonId]));
    }
  };

  const toggleLessonComplete = async (lessonId) => {
    try {
      await markLessonComplete(id, lessonId);
      setCompletedLessonIds((prev) => {
        const next = new Set(prev);
        if (next.has(lessonId)) {
          next.delete(lessonId);
        } else {
          next.add(lessonId);
        }
        return next;
      });
    } catch (err) {
      setCompletedLessonIds((prev) => {
        const next = new Set(prev);
        if (next.has(lessonId)) {
          next.delete(lessonId);
        } else {
          next.add(lessonId);
        }
        return next;
      });
    }
  };

  // Automatically mark PDF and TEXT lessons as completed when viewed
  useEffect(() => {
    if (activeLessonId) {
      const current = course?.modules?.flatMap((m) => m.lessons || []).find((l) => l.id === activeLessonId);
      if (current && (current.lessonType === 'PDF' || current.lessonType === 'TEXT')) {
        handleAutoCompleteLesson(current.id);
      }
    }
  }, [activeLessonId]);


  const handleCreateModuleSubmit = async (e) => {
    e.preventDefault();
    setModuleError('');
    if (!moduleTitle.trim()) {
      setModuleError('Module title is required');
      return;
    }

    setIsSubmittingModule(true);
    try {
      const updatedCourse = await addModule(id, { title: moduleTitle.trim() });
      setCourse(updatedCourse);
      setActiveModuleModal(false);
      setModuleTitle('');
    } catch (err) {
      setModuleError(err.response?.data?.error || err.response?.data?.message || 'Failed to add module.');
    } finally {
      setIsSubmittingModule(false);
    }
  };

  const handleCreateLessonSubmit = async (e) => {
    e.preventDefault();
    setLessonError('');
    if (!lessonTitle.trim()) {
      setLessonError('Lesson title is required');
      return;
    }

    setIsSubmittingLesson(true);
    try {
      let finalMediaUrl = null;
      let finalVideoType = null;

      if (lessonType === 'VIDEO' && videoInputType === 'YOUTUBE') {
        if (!youtubeUrl.trim()) {
          setLessonError('YouTube URL is required for YouTube video lessons');
          setIsSubmittingLesson(false);
          return;
        }
        finalMediaUrl = youtubeUrl.trim();
        finalVideoType = 'YOUTUBE';
      }

      const newLesson = await addLesson(activeLessonModalModuleId, {
        title: lessonTitle.trim(),
        content: lessonContent.trim(),
        lessonType,
        mediaUrl: finalMediaUrl,
        videoType: finalVideoType,
      });

      // Upload local PDF or Video file if attached
      if (mediaFile && (lessonType === 'PDF' || (lessonType === 'VIDEO' && videoInputType === 'FILE'))) {
        await uploadLessonMedia(newLesson.id, mediaFile, lessonType);
      }

      await loadData();
      setActiveLessonModalModuleId(null);
      setLessonTitle('');
      setLessonContent('');
      setLessonType('TEXT');
      setYoutubeUrl('');
      setMediaFile(null);
    } catch (err) {
      setLessonError(err.response?.data?.error || err.response?.data?.message || 'Failed to add lesson.');
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  // Find currently active lesson object
  const activeLesson = course?.modules?.flatMap((m) => m.lessons || []).find((l) => l.id === activeLessonId);

  // Compute total lessons count & completed count
  const allLessons = course?.modules?.flatMap((m) => m.lessons || []) || [];
  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = completedLessonIds.size;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: '1350px', margin: '0 auto', padding: '24px 20px' }}>
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            color: 'var(--color-danger)',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '32px' }}>
            <LoadingSkeleton width="60%" height="32px" />
            <LoadingSkeleton width="100%" height="20px" />
            <LoadingSkeleton width="40%" height="20px" />
          </Card>
        ) : !course ? (
          <Card style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--text-primary)' }}>Course Not Found</h2>
          </Card>
        ) : (
          /* Main 2-Column Portal Layout */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px' }}>
            {/* Left Column: Primary Content Viewport (~70% width) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Breadcrumb Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Link to="/courses" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Courses</Link>
                <span>›</span>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>{course.title}</span>
              </div>

              {/* Course Title & Key Metadata Header */}
              <div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                  {activeLesson ? activeLesson.title : course.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  <span>⭐ 4.8 Rating</span>
                  <span>👥 {totalLessonsCount} Lessons</span>
                  <span>👤 Instructor: <strong style={{ color: 'var(--text-primary)' }}>{course.instructorName || 'Skillforge Instructor'}</strong></span>
                </div>
              </div>

              {/* Main Media Player / PDF / Text Viewport */}
              <Card style={{ padding: '0', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                {!activeLesson ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Select a lesson from the curriculum sidebar to begin studying.
                  </div>
                ) : (
                  <div>
                    {activeLesson.lessonType === 'VIDEO' && (
                      <div style={{ padding: '0' }}>
                        <VideoPlayer
                          videoUrl={activeLesson.mediaUrl}
                          videoType={activeLesson.videoType}
                          title={activeLesson.title}
                          onVideoEnded={() => handleAutoCompleteLesson(activeLesson.id)}
                        />
                      </div>
                    )}


                    {activeLesson.lessonType === 'PDF' && (
                      <div style={{ padding: '16px' }}>
                        <PdfViewer
                          pdfUrl={activeLesson.mediaUrl}
                          title={activeLesson.title}
                          textContent={activeLesson.content}
                        />
                      </div>
                    )}

                    {activeLesson.lessonType === 'TEXT' && activeLesson.content && (
                      <div style={{ padding: '24px 28px', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {activeLesson.content}
                      </div>
                    )}

                  </div>
                )}
              </Card>

              {/* Tabs Bar: Overview | Notes | Announcements */}
              <div style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '24px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  style={{
                    padding: '10px 4px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: activeTab === 'overview' ? 'var(--accent-light)' : 'var(--text-secondary)',
                    fontWeight: activeTab === 'overview' ? 700 : 500,
                    fontSize: '0.95rem',
                    borderBottom: activeTab === 'overview' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  style={{
                    padding: '10px 4px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: activeTab === 'notes' ? 'var(--accent-light)' : 'var(--text-secondary)',
                    fontWeight: activeTab === 'notes' ? 700 : 500,
                    fontSize: '0.95rem',
                    borderBottom: activeTab === 'notes' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Study Notes
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <Card style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                    Course Description
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                    {course.description || 'Welcome to Skillforge! Master your skills step-by-step with structured modules, interactive lessons, and module quizzes.'}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Skill Level</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>All Levels</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Total Modules</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{course.modules?.length || 0} Modules</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Certification</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-success)' }}>Available on Completion</strong>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'notes' && (
                <Card style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                    Lesson Study Notes
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Take notes while studying. Use the quiz engine to test your recall!
                  </p>
                </Card>
              )}
            </div>


            {/* Right Column: Course Content / Curriculum Sidebar (~30% width) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Visual Progress Bar & Claim Certificate CTA */}

              {(() => {
                const progressPercent = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;
                return (
                  <Card style={{ padding: '16px 20px', backgroundColor: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <span>Course Completion Progress</span>
                      <strong style={{ color: progressPercent === 100 ? 'var(--color-success)' : 'var(--accent-light)', fontWeight: 700 }}>
                        {progressPercent}%
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                      <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: progressPercent === 100 ? 'var(--color-success)' : 'var(--accent-primary)', transition: 'width 0.4s ease' }} />
                    </div>

                    <button
                      type="button"
                      onClick={handleClaimCertificate}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#eab308',
                        color: '#0f172a',
                        border: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 14px rgba(234, 179, 8, 0.3)',
                      }}
                    >
                      <span>🎓</span> Claim Certificate of Completion
                    </button>
                  </Card>
                );
              })()}

              {/* Main Course Quiz Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/courses/${id}/quiz`)}
                fullWidth
                style={{ py: '14px' }}
              >
                🏆 Take Final Course Quiz
              </Button>

              {/* Sidebar Header */}
              <Card style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Course Content
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {completedLessonsCount} / {totalLessonsCount} Completed
                    </span>
                  </div>

                  {isOwner && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { setModuleError(''); setActiveModuleModal(true); }}
                    >
                      + Add Module
                    </Button>
                  )}
                </div>


                {/* Modules Accordion List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {course.modules?.map((module, mIdx) => {
                    const isCompleted = completedModuleIds.has(module.id);
                    return (
                      <div
                        key={module.id}
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Module Accordion Header */}
                        <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              Module {mIdx + 1}: {module.title}
                            </h3>
                            {isCompleted && (
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                                Done ✓
                              </span>
                            )}
                          </div>

                          {/* Module Quiz Action */}
                          <button
                            type="button"
                            onClick={() => setActiveModuleQuiz({ moduleId: module.id, title: module.title })}
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(99, 102, 241, 0.12)',
                              border: '1px dashed var(--accent-primary)',
                              color: 'var(--accent-light)',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textAlign: 'center',
                            }}
                          >
                            🎯 Take Module Quiz (100% Required)
                          </button>
                        </div>

                        {/* Lessons List in Module */}
                        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {module.lessons?.map((lesson, lIdx) => {
                            const isActive = lesson.id === activeLessonId;
                            const isDone = completedLessonIds.has(lesson.id);

                            return (
                              <div
                                key={lesson.id}
                                onClick={() => setActiveLessonId(lesson.id)}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: 'var(--radius-md)',
                                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  fontSize: '0.85rem',
                                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                  fontWeight: isActive ? 600 : 400,
                                  transition: 'all var(--transition-fast)',
                                }}
                              >
                                  {/* LEFT-ALIGNED Radio Button Marker (Same style as Quiz Options) */}
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleLessonComplete(lesson.id);
                                    }}
                                    style={{
                                      width: '14px',
                                      height: '14px',
                                      borderRadius: '50%',
                                      border: isDone ? '2px solid var(--accent-primary)' : '2px solid var(--text-muted)',
                                      backgroundColor: 'transparent',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {isDone && (
                                      <div
                                        style={{
                                          width: '6px',
                                          height: '6px',
                                          borderRadius: '50%',
                                          backgroundColor: 'var(--accent-primary)',
                                        }}
                                      />
                                    )}
                                  </div>



                                {/* Lesson Title & Type Icon */}
                                <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <span style={{ marginRight: '6px' }}>
                                    {lesson.lessonType === 'PDF' ? '📄' : lesson.lessonType === 'VIDEO' ? '🎥' : '📝'}
                                  </span>
                                  {lIdx + 1}. {lesson.title}
                                </div>
                              </div>
                            );
                          })}

                          {isOwner && (
                            <button
                              type="button"
                              onClick={() => {
                                setLessonError('');
                                setMediaFile(null);
                                setActiveLessonModalModuleId(module.id);
                              }}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: 'var(--accent-light)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'left',
                                padding: '8px 12px',
                              }}
                            >
                              + Add Lesson to Module
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Instructor Delete Course Option */}
              {isOwner && (
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={isDeleting}
                  onClick={async () => {
                    if (!window.confirm(`Are you sure you want to delete "${course.title}"?`)) return;
                    setIsDeleting(true);
                    try {
                      await deleteCourse(id);
                      navigate('/courses');
                    } catch (err) {
                      alert(err.response?.data?.error || 'Failed to delete course');
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                >
                  Delete Course
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Add Module Modal */}
        {activeModuleModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
            <Card style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
                Add New Module
              </h3>
              {moduleError && <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{moduleError}</div>}
              <form onSubmit={handleCreateModuleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Input label="Module Title" placeholder="e.g. Introduction to Environment Setup" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Button type="button" variant="outline" onClick={() => setActiveModuleModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" isLoading={isSubmittingModule}>Save Module</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Add Rich Lesson Modal */}
        {activeLessonModalModuleId && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
            <Card style={{ width: '100%', maxWidth: '520px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
                Add Rich Lesson
              </h3>
              {lessonError && <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{lessonError}</div>}
              <form onSubmit={handleCreateLessonSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Input label="Lesson Title" placeholder="e.g. VS Code Details" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Lesson Format / Type
                  </label>
                  <select
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="TEXT">📝 Text / Markdown Website Content</option>
                    <option value="PDF">📄 PDF Document (Inline Viewer)</option>
                    <option value="VIDEO">🎥 Video Lesson (YouTube or Local File)</option>
                  </select>
                </div>

                {lessonType === 'VIDEO' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Video Source
                    </label>
                    <select
                      value={videoInputType}
                      onChange={(e) => setVideoInputType(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', marginBottom: '10px' }}
                    >
                      <option value="YOUTUBE">▶ YouTube Video Link</option>
                      <option value="FILE">📁 Local MP4 / WebM File Upload</option>
                    </select>

                    {videoInputType === 'YOUTUBE' ? (
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                      />
                    ) : (
                      <input
                        type="file"
                        accept="video/mp4, video/webm"
                        onChange={(e) => setMediaFile(e.target.files[0])}
                        style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}
                      />
                    )}
                  </div>
                )}

                {lessonType === 'PDF' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Upload PDF Document
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setMediaFile(e.target.files[0])}
                      style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Written Notes / Text Body
                  </label>
                  <textarea
                    rows={4}
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    placeholder="Enter written explanations, summary, or study notes..."
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <Button type="button" variant="outline" onClick={() => setActiveLessonModalModuleId(null)}>Cancel</Button>
                  <Button type="submit" variant="primary" isLoading={isSubmittingLesson}>Save Lesson</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Per-Module Quiz Modal */}
        {activeModuleQuiz && (
          <ModuleQuizModal
            moduleId={activeModuleQuiz.moduleId}
            moduleTitle={activeModuleQuiz.title}
            isOwner={isOwner}
            onClose={() => setActiveModuleQuiz(null)}
            onModuleCompleted={(modId) => {
              setCompletedModuleIds((prev) => new Set([...prev, modId]));
            }}
          />
        )}

        {/* Certificate Modal */}

        {certificateData && (
          <CertificateModal
            certificateData={certificateData}
            onClose={() => setCertificateData(null)}
          />
        )}

        {/* Floating AI Assistant Chatbox */}
        <AiTutorWidget courseTitle={course?.title} activeLesson={activeLesson} />
      </main>
    </div>
  );
};




export default CourseDetailPage;
