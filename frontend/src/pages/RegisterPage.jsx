import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/authApi';
import { Button, Input, Card } from '../components/common';

/**
 * Register page — full name, email, password, confirm password, and role selection.
 * Calls POST /api/auth/register, stores the JWT and user in AuthContext
 * on success, and redirects to /courses.
 */
const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Validates form fields before submitting.
   *
   * @returns {boolean} true if validation passes
   */
  const validateForm = () => {
    const errors = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles form submission — validates, calls the API, and stores credentials.
   *
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { token, ...user } = await registerUser({ fullName, email, password, role });
      login(token, user);
      navigate('/courses', { replace: true });
    } catch (err) {
      const message = err.response?.data?.error
        || err.response?.data?.message
        || (err.message === 'Network Error' ? 'Cannot connect to backend server at http://localhost:8080/api. Is Spring Boot running?' : err.message)
        || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Inline styles for the role selector buttons. */
  const roleButtonStyle = (isActive) => ({
    flex: 1,
    padding: '10px 16px',
    borderRadius: 'var(--radius-md)',
    border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
    color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    textAlign: 'center',
    transition: 'all var(--transition-fast)',
    outline: 'none',
    boxSizing: 'border-box',
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <Card style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Join Skillforge as a student or instructor
          </p>

        </div>

        {/* API-level error banner */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '20px',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full Name"
            type="text"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={fieldErrors.fullName}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
          />

          {/* Role selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}>
              I am a...
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                style={roleButtonStyle(role === 'STUDENT')}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('INSTRUCTOR')}
                style={roleButtonStyle(role === 'INSTRUCTOR')}
              >
                Instructor
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            style={{ marginTop: '8px' }}
          >
            Create Account
          </Button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-light)', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
