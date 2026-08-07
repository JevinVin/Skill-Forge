import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSkeleton } from '../common';

/**
 * Route guard component that redirects unauthenticated users to /login.
 *
 * While the auth session is being restored (isLoading), displays a
 * loading skeleton instead of flashing the login page.
 *
 * Preserves the original URL in location state so LoginPage can
 * redirect the user back after successful authentication.
 *
 * @param {{ children: React.ReactNode }} props
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while session is being restored on app load
  if (isLoading) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '80px auto',
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <LoadingSkeleton width="40%" height="28px" />
        <LoadingSkeleton width="100%" height="16px" />
        <LoadingSkeleton width="80%" height="16px" />
        <LoadingSkeleton width="60%" height="16px" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Pass the attempted URL so login can redirect back after auth
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
