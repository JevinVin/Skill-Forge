import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../common';

/**
 * CourseCard component displaying an overview of a course in the browsing grid.
 *
 * @param {Object} props
 * @param {Object} props.course
 * @param {number|string} props.course.id
 * @param {string} props.course.title
 * @param {string} props.course.description
 * @param {string} props.course.instructorName
 * @param {number} [props.course.moduleCount=0]
 */
export const CourseCard = ({ course }) => {
  return (
    <Card hoverable style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {course.title}
          </h3>
        </div>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          marginBottom: '20px',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {course.description || 'No description provided.'}
        </p>
      </div>

      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '16px',
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructor</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {course.instructorName || 'Unknown Instructor'}
          </span>
        </div>

        <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="sm">
            View Course
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default CourseCard;
