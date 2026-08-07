import client from './client';

/**
 * Progress & Dashboard API calls.
 * Separated from UI components per code-generation-guide rules.
 */

/**
 * Fetches real-time dashboard stats, progress bars, and achievement badges.
 *
 * @returns {Promise<{
 *   userRole: string,
 *   fullName: string,
 *   totalEnrolledCourses: number,
 *   totalCompletedLessons: number,
 *   totalQuizzesAttempted: number,
 *   averageQuizScore: number,
 *   courseProgresses: Array,
 *   badges: Array,
 *   instructorTotalCourses: number,
 *   instructorTotalLessons: number,
 *   instructorAvgQuizScore: number
 * }>}
 */
export const fetchDashboardStats = async () => {
  const response = await client.get('/dashboard');
  return response.data;
};

/**
 * Toggles a lesson's completion state for the authenticated student.
 *
 * @param {number|string} courseId
 * @param {number|string} lessonId
 * @returns {Promise<{ lessonId: number, courseId: number, completed: boolean }>}
 */
export const markLessonComplete = async (courseId, lessonId) => {
  const response = await client.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
  return response.data;
};
