import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import CourseCard from '../components/course/CourseCard';
import CreateCourseModal from '../components/course/CreateCourseModal';
import { fetchCourses } from '../api/courseApi';
import { LoadingSkeleton, Card, Button, Input } from '../components/common';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Web Development', 'Java & Backend', 'AI & Machine Learning', 'Data Science'];

/**
 * Main courses list page — updated with real-time Search Bar and Category Filtering.
 * Displays all available courses in a responsive grid.
 */
const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  // Filter courses by search query and selected category
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !searchQuery.trim() ||
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructorName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      (course.title && course.title.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0])) ||
      (course.description && course.description.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0]));

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar onCreateCourseClick={() => setIsModalOpen(true)} />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Header Title & Subtitle */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Explore Courses
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Discover interactive courses, structured modules, knowledge quizzes, and official certificates.
          </p>
        </div>

        {/* Real-time Search Bar & Category Filter Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Input
                placeholder="🔍 Search courses by title, instructor, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isInstructor && (
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                + Create Course
              </Button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
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
        ) : filteredCourses.length === 0 ? (
          <Card style={{ padding: '60px 20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {courses.length === 0 ? 'No Courses Available Yet' : 'No Matching Courses Found'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              {courses.length === 0
                ? isInstructor ? 'Get started by creating the first course for your platform.' : 'Check back soon for new course offerings.'
                : 'Try adjusting your search query or selecting another category filter.'}
            </p>
            {courses.length === 0 && isInstructor && (
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                + Create First Course
              </Button>
            )}
          </Card>
        ) : (
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', fontWeight: 600 }}>
              Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
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
