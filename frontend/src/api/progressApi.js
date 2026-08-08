import client from './client';

/**
 * Progress & Dashboard API calls.
 * Separated from UI components per code-generation-guide rules.
 */

/**
 * Fetches real-time dashboard stats, progress bars, and achievement badges.
 */
export const fetchDashboardStats = async () => {
  const response = await client.get('/dashboard');
  return response.data;
};

/**
 * Marks a lesson's completion state for the authenticated student.
 */
export const markLessonComplete = async (courseId, lessonId) => {
  const response = await client.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
  return response.data;
};

/**
 * Fetches Certificate of Completion details for a 100% completed course.
 *
 * @param {number|string} courseId
 * @returns {Promise<{ eligible: boolean, certificateId: string, studentName: string, courseTitle: string, instructorName: string, completionPercentage: number, issueDate: string, message: string }>}
 */
export const fetchCertificate = async (courseId) => {
  const response = await client.get(`/courses/${courseId}/certificate`);
  return response.data;
};
