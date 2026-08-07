import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/authApi';
import { Button, Input, Card } from '../components/common';

/**
 * Login page — email/password form using the existing Input and Button
 * components. Calls POST /api/auth/login via authApi, stores the JWT
 * and user in AuthContext on success, and redirects to the intended
 * destination (or /courses by default).
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect back to the page the user tried to visit before being bounced
  const redirectTo = location.state?.from?.pathname || '/courses';

  /**
   * Validates form fields before submitting.
   *
   * @returns {boolean} true if validation passes
   */
  const validateForm = () => {
    const errors = {};

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
      const { token, ...user } = await loginUser({ email, password });
      login(token, user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err.response?.data?.error
        || err.response?.data?.message
        || (err.message === 'Network Error' ? 'Cannot connect to backend server at http://localhost:8080/api. Is Spring Boot running?' : err.message)
        || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Sign in to your Skillforge account
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            style={{ marginTop: '8px' }}
          >
            Sign In
          </Button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-light)', fontWeight: 500 }}>
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;
