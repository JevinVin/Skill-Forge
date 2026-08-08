import client from './client';

/**
 * Progress & Dashboard API calls.
 */

/**
 * Fetches real-time dashboard stats, progress bars, and achievement badges.
 */
export const fetchDashboardStats = async () => {
  const response = await client.get('/dashboard');
  return response.data;
};

/**
 * Fetches detailed course progress state (completed lesson IDs, completed module quiz IDs,
 * weighted percentage, and item counts).
 *
 * @param {number|string} courseId
 * @returns {Promise<{ courseId: number, completedLessonIds: Array<number>, completedModuleIds: Array<number>, totalLessonsCount: number, completedLessonsCount: number, totalQuizzesCount: number, completedQuizzesCount: number, totalItemsCount: number, completedItemsCount: number, overallProgressPercentage: number }>}
 */
export const fetchCourseProgressDetails = async (courseId) => {
  const response = await client.get(`/courses/${courseId}/progress`);
  return response.data;
};

/**
 * Marks a lesson's completion state permanently for the authenticated student.
 */
export const markLessonComplete = async (courseId, lessonId) => {
  const response = await client.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
  return response.data;
};

/**
 * Fetches Certificate of Completion details for a 100% completed course.
 */
export const fetchCertificate = async (courseId) => {
  const response = await client.get(`/courses/${courseId}/certificate`);
  return response.data;
};
