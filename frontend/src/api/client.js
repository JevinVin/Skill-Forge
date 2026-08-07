import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Custom Axios instance configured for the Learning Platform API.
 *
 * Automatically injects the JWT token into request headers and handles
 * authentication errors globally.
 */
const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Attaches the JWT Bearer token from localStorage to every outgoing API request.
 */
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Handles 401 Unauthorized globally by clearing stored auth credentials and
 * redirecting the browser to the login page if not already there.
 */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Prevent infinite redirect loop if already on /login or /register
      const authPaths = ['/login', '/register'];
      if (!authPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
