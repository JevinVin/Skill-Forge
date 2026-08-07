import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { fetchDashboardStats } from '../api/progressApi';
import { Card, Button, LoadingSkeleton } from '../components/common';
import { useAuth } from '../context/AuthContext';

/**
 * DashboardPage component — renders a personalized learning dashboard
 * featuring progress metrics, course progress bars, quiz averages,
 * achievement badges, and instructor summary stats.
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (err) {
        const msg = err.response?.data?.error
          || err.response?.data?.message
          || 'Failed to load dashboard metrics.';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 20px' }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Welcome back, {stats?.fullName || user?.fullName || 'Learner'}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            {stats?.userRole === 'INSTRUCTOR'
              ? 'Track your course metrics and view learning statistics across your courses.'
              : 'Keep track of your course progress, quiz scores, and earned achievement badges.'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: '28px',
            color: 'var(--color-danger)',
            fontSize: '0.95rem',
          }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <LoadingSkeleton height="110px" />
              <LoadingSkeleton height="110px" />
              <LoadingSkeleton height="110px" />
              <LoadingSkeleton height="110px" />
            </div>
            <LoadingSkeleton height="250px" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
            {/* Stat Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {/* Stat 1 */}
              <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '1.8rem' }}>📚</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats?.totalEnrolledCourses || 0}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Active Courses
                </span>
              </Card>

              {/* Stat 2 */}
              <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '1.8rem' }}>✅</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats?.totalCompletedLessons || 0}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Lessons Completed
                </span>
              </Card>

              {/* Stat 3 */}
              <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '1.8rem' }}>🎯</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats?.totalQuizzesAttempted || 0}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Quizzes Taken
                </span>
              </Card>

              {/* Stat 4 */}
              <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '1.8rem' }}>🏆</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-light)' }}>
                  {stats?.averageQuizScore ? `${stats.averageQuizScore}%` : 'N/A'}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Average Quiz Score
                </span>
              </Card>
            </div>

            {/* Course Progress Section */}
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
                Your Course Progress
              </h2>

              {!stats?.courseProgresses || stats.courseProgresses.length === 0 ? (
                <Card style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    You have not started any courses yet.
                  </p>
                  <Link to="/courses" style={{ textDecoration: 'none' }}>
                    <Button variant="primary">Browse Courses</Button>
                  </Link>
                </Card>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {stats.courseProgresses.map((cp) => (
                    <Card key={cp.courseId} style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {cp.courseTitle}
                          </h3>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Instructor: {cp.instructorName}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-light)' }}>
                            {cp.completedLessons} / {cp.totalLessons} lessons ({cp.progressPercentage}%)
                          </span>

                          <Link to={`/courses/${cp.courseId}`} style={{ textDecoration: 'none' }}>
                            <Button variant="outline" size="sm">
                              Continue Learning →
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div style={{
                        width: '100%',
                        height: '10px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                      }}>
                        <div style={{
                          width: `${cp.progressPercentage}%`,
                          height: '100%',
                          backgroundColor: cp.isCompleted ? 'var(--color-success)' : 'var(--accent-primary)',
                          borderRadius: '6px',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Achievement Badges Section */}
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
                Achievement Badges
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px' }}>
                {stats?.badges?.map((badge) => (
                  <Card
                    key={badge.code}
                    style={{
                      padding: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      opacity: badge.earned ? 1 : 0.45,
                      border: badge.earned ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      backgroundColor: badge.earned ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-secondary)',
                    }}
                  >
                    <div style={{
                      fontSize: '2.5rem',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: badge.earned ? '0 0 12px rgba(99, 102, 241, 0.3)' : 'none',
                    }}>
                      {badge.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {badge.title}
                        </h4>
                        {badge.earned && <span style={{ color: 'var(--color-success)', fontSize: '0.85rem' }}>✓</span>}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {badge.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
