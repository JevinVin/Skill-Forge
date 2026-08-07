import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../api/authApi';

/**
 * @typedef {Object} AuthContextValue
 * @property {object|null} user - The authenticated user object, or null.
 * @property {string|null} token - The JWT token, or null.
 * @property {boolean} isLoading - True while the session is being restored on app load.
 * @property {boolean} isAuthenticated - True if a valid user session exists.
 * @property {(token: string, user: object) => void} login - Stores credentials and sets state.
 * @property {() => void} logout - Clears credentials and resets state.
 */

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and manages authentication state.
 *
 * On mount, checks localStorage for an existing token and validates it
 * by calling GET /api/auth/me. If valid, restores the session. If the
 * token is expired or invalid, clears localStorage silently.
 *
 * @param {{ children: React.ReactNode }} props
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Restores session from localStorage on initial app load.
   * Called once — validates the stored token against the backend.
   */
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Validate token by fetching the current user profile
        const userData = await getCurrentUser();
        setToken(storedToken);
        setUser(userData);
      } catch (error) {
        // Token is expired or invalid — clean up silently
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Stores the JWT and user in both React state and localStorage.
   * Called after a successful login or register API call.
   *
   * @param {string} newToken - JWT token from the backend
   * @param {object} newUser - User object from the backend
   */
  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  /**
   * Clears all auth state and localStorage.
   * Redirects to /login after cleanup.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to consume the AuthContext.
 * Must be used within an AuthProvider.
 *
 * @returns {AuthContextValue}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
