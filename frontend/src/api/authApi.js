import client from './client';

/**
 * Auth API calls.
 * Separated from UI components to keep API logic in the api/ layer
 * per code-generation-guide (no business logic in components).
 */

/**
 * Registers a new user.
 *
 * @param {{ fullName: string, email: string, password: string, role?: string }} data
 * @returns {Promise<{ token: string, user: object }>}
 */
export const registerUser = async (data) => {
  const response = await client.post('/auth/register', data);
  return response.data;
};

/**
 * Logs in an existing user.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 */
export const loginUser = async (credentials) => {
  const response = await client.post('/auth/login', credentials);
  return response.data;
};

/**
 * Fetches the currently authenticated user's profile.
 * Requires a valid JWT in localStorage (auto-attached by client.js interceptor).
 *
 * @returns {Promise<object>} the user object
 */
export const getCurrentUser = async () => {
  const response = await client.get('/auth/me');
  return response.data;
};
