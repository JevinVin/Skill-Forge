import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';
import PlaygroundPage from './pages/PlaygroundPage';


/**
 * Main application component — defines all application routes.
 *
 * Public routes: /login, /register
 * Protected routes: /courses, /courses/:id, /courses/:id/quiz, /dashboard
 * Default: redirects to /courses
 */
function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected course & dashboard routes */}
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <CourseDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:id/quiz"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/playground"
        element={
          <ProtectedRoute>
            <PlaygroundPage />
          </ProtectedRoute>
        }
      />


      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/courses" replace />} />
    </Routes>
  );
}

export default App;
