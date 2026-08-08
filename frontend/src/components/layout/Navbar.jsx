import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common';

/**
 * Global Navbar component.
 * Displays platform title/branding, navigation links (Courses & Dashboard),
 * user info (name + role badge), "+ Create Course" button for instructors, and Sign Out action.
 *
 * @param {Object} props
 * @param {() => void} [props.onCreateCourseClick] - Callback when instructor clicks "+ Create Course"
 */
export const Navbar = ({ onCreateCourseClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isInstructor = user?.role === 'INSTRUCTOR';

  return (
    <header style={{
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand & Main Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to="/courses" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#ffffff',
            fontSize: '1rem',
            letterSpacing: '0.5px',
          }}>
            SF
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Skillforge
          </span>

        </Link>

        <nav style={{ display: 'flex', gap: '16px' }}>
          <Link
            to="/courses"
            style={{
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: location.pathname === '/courses' ? 700 : 500,
              color: location.pathname === '/courses' ? 'var(--accent-light)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
          >
            Courses
          </Link>
          <Link
            to="/dashboard"
            style={{
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: location.pathname === '/dashboard' ? 700 : 500,
              color: location.pathname === '/dashboard' ? 'var(--accent-light)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/playground"
            style={{
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: location.pathname === '/playground' ? 700 : 500,
              color: location.pathname === '/playground' ? 'var(--accent-light)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
          >
            💻 Playground
          </Link>
        </nav>

      </div>

      {/* User Actions & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isInstructor && onCreateCourseClick && (
          <Button variant="primary" size="sm" onClick={onCreateCourseClick}>
            + Create Course
          </Button>
        )}

        {/* User Info Badge */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {user.fullName || user.email}
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: isInstructor ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isInstructor ? 'var(--accent-light)' : 'var(--color-success)',
              border: isInstructor ? '1px solid var(--accent-primary)' : '1px solid var(--color-success)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {user.role}
            </span>
          </div>
        )}

        {/* Sign Out Button */}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
