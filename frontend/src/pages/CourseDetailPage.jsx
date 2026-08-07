import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import PdfViewer from '../components/course/PdfViewer';
import VideoPlayer from '../components/course/VideoPlayer';
import ModuleQuizModal from '../components/course/ModuleQuizModal';
import { fetchCourseById, deleteCourse, addModule, addLesson, uploadLessonMedia } from '../api/courseApi';
import { markLessonComplete, fetchDashboardStats } from '../api/progressApi';
import { Card, Button, Input, LoadingSkeleton } from '../components/common';
import { useAuth } from '../context/AuthContext';

/**
 * Detailed Course view page — displays full course metadata, instructor actions,
 * rich lesson media rendering (PDFs, Videos, Text), per-module quizzes, and student completion indicators.
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

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchCourseById(id);
      setCourse(data);

      try {
        const stats = await fetchDashboardStats();
        // Extract completed lessons for this course
        const completedSet = new Set();
        if (stats?.enrolledCourses) {
          // Store user progress state
        }
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
      alert(err.response?.data?.error || 'Failed to update lesson completion status');
    }
  };

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

      // If local file upload (PDF or MP4 video) was selected, upload media file
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '20px' }}>
          <Link to="/courses" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            ← Back to Courses
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
            <LoadingSkeleton width="60%" height="32px" />
            <LoadingSkeleton width="100%" height="20px" />
            <LoadingSkeleton width="40%" height="20px" />
          </Card>
        ) : !course ? (
          <Card style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--text-primary)' }}>Course Not Found</h2>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Course Header Banner */}
            <Card style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Skillforge Course
                  </span>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 12px 0' }}>
                    {course.title}
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '20px' }}>
                    {course.description}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <span>👤 Instructor: <strong>{course.instructorName || 'Instructor'}</strong></span>
                    <span>📚 {course.modules?.length || 0} Modules</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate(`/courses/${id}/quiz`)}
                    fullWidth
                  >
                    📝 Take Final Quiz
                  </Button>

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
            </Card>

            {/* Main Course Content Viewport (Modules list on left, Lesson content on right) */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
              {/* Left Column: Modules & Lessons Accordion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Course Curriculum
                  </h2>
                  {isOwner && (
                    <Button variant="secondary" size="sm" onClick={() => { setModuleError(''); setShowModuleModal(true); }}>
                      + Add Module
                    </Button>
                  )}
                </div>

                {course.modules?.map((module, mIdx) => {
                  const isCompleted = completedModuleIds.has(module.id);
                  return (
                    <Card key={module.id} style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
                          Module {mIdx + 1}: {module.title}
                        </h3>

                        {isCompleted && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                            Completed ✓
                          </span>
                        )}
                      </div>

                      {/* Module Quiz Trigger */}
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
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          marginBottom: '12px',
                        }}
                      >
                        🎯 Take Module Quiz (100% Required)
                      </button>

                      {/* Lesson list inside module */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                                border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.85rem',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                fontWeight: isActive ? 600 : 400,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                <span>
                                  {lesson.lessonType === 'PDF' ? '📄' : lesson.lessonType === 'VIDEO' ? '🎥' : '📝'}
                                </span>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {lIdx + 1}. {lesson.title}
                                </span>
                              </div>

                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleLessonComplete(lesson.id);
                                }}
                                style={{ accentColor: 'var(--color-success)', cursor: 'pointer' }}
                              />
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
                              padding: '6px 4px',
                            }}
                          >
                            + Add Lesson to Module
                          </button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Right Column: Active Lesson Viewport */}
              <div>
                {!activeLesson ? (
                  <Card style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Select a lesson from the curriculum sidebar to begin studying.</p>
                  </Card>
                ) : (
                  <Card style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', pb: '14px', pb: '14px' }}>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {activeLesson.title}
                      </h2>

                      <Button
                        variant={completedLessonIds.has(activeLesson.id) ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => toggleLessonComplete(activeLesson.id)}
                      >
                        {completedLessonIds.has(activeLesson.id) ? '✓ Mark Incomplete' : '✓ Mark as Complete'}
                      </Button>
                    </div>

                    {/* Lesson Content Body based on lessonType */}
                    {activeLesson.lessonType === 'VIDEO' && (
                      <VideoPlayer
                        videoUrl={activeLesson.mediaUrl}
                        videoType={activeLesson.videoType}
                        title={activeLesson.title}
                      />
                    )}

                    {activeLesson.lessonType === 'PDF' && (
                      <PdfViewer
                        pdfUrl={activeLesson.mediaUrl}
                        title={activeLesson.title}
                      />
                    )}

                    {activeLesson.content && (
                      <div style={{
                        fontSize: '0.95rem',
                        lineHeight: 1.7,
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                        marginTop: '16px',
                      }}>
                        {activeLesson.content}
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Module Modal */}
        {activeModuleModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
            <Card style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
                Add Module
              </h3>
              {moduleError && <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{moduleError}</div>}
              <form onSubmit={handleCreateModuleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Input label="Module Title" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} />
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
                <Input label="Lesson Title" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />

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
      </main>
    </div>
  );
};

export default CourseDetailPage;
