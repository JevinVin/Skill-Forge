import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import CourseCard from '../components/course/CourseCard';
import CreateCourseModal from '../components/course/CreateCourseModal';
import { fetchCourses } from '../api/courseApi';
import { LoadingSkeleton, Card, Button } from '../components/common';
import { useAuth } from '../context/AuthContext';

/**
 * Main courses list page — displays all available courses in a responsive grid.
 * Allows Instructors to trigger course creation via CreateCourseModal.
 */
const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();
  const isInstructor = user?.role === 'INSTRUCTOR';

  const loadCourses = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchCourses();
      setCourses(data);
    } catch (err) {
      const message = err.response?.data?.error
        || err.response?.data?.message
        || 'Failed to load courses. Please refresh.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCourseCreated = (newCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar onCreateCourseClick={() => setIsModalOpen(true)} />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Explore Courses
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Discover interactive courses, structured modules, and knowledge quizzes.
          </p>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} style={{ height: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <LoadingSkeleton width="70%" height="24px" />
                <LoadingSkeleton width="100%" height="16px" />
                <LoadingSkeleton width="90%" height="16px" />
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                  <LoadingSkeleton width="40%" height="16px" />
                  <LoadingSkeleton width="30%" height="32px" borderRadius="var(--radius-md)" />
                </div>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card style={{ padding: '60px 20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              No Courses Available Yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              {isInstructor
                ? 'Get started by creating the first course for your platform.'
                : 'Check back soon for new course offerings.'}
            </p>
            {isInstructor && (
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                + Create First Course
              </Button>
            )}
          </Card>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>

      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCourseCreated={handleCourseCreated}
      />
    </div>
  );
};

export default CoursesPage;
