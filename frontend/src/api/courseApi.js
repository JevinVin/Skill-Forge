import client from './client';

/**
 * Course API calls.
 * Separated from UI components per code-generation-guide rules.
 */

/**
 * Fetches the list of all courses.
 *
 * @returns {Promise<Array<{ id: number, title: string, description: string, instructorId: number, instructorName: string, moduleCount: number, createdAt: string }>>}
 */
export const fetchCourses = async () => {
  const response = await client.get('/courses');
  return response.data;
};

/**
 * Fetches full details for a single course, including its modules and lessons.
 *
 * @param {number|string} courseId
 * @returns {Promise<{ id: number, title: string, description: string, instructorId: number, instructorName: string, instructorEmail: string, modules: Array, createdAt: string }>}
 */
export const fetchCourseById = async (courseId) => {
  const response = await client.get(`/courses/${courseId}`);
  return response.data;
};

/**
 * Creates a new course. Restricted to INSTRUCTOR role users on the backend.
 *
 * @param {{ title: string, description: string }} courseData
 * @returns {Promise<object>} created course object
 */
export const createCourse = async (courseData) => {
  const response = await client.post('/courses', courseData);
  return response.data;
};

/**
 * Deletes a course by ID. Restricted to the owning INSTRUCTOR on the backend.
 *
 * @param {number|string} courseId
 * @returns {Promise<void>}
 */
export const deleteCourse = async (courseId) => {
  await client.delete(`/courses/${courseId}`);
};

/**
 * Adds a new module to a course. Restricted to the course INSTRUCTOR owner.
 *
 * @param {number|string} courseId
 * @param {{ title: string }} moduleData
 * @returns {Promise<object>} created module object
 */
export const addModule = async (courseId, moduleData) => {
  const response = await client.post(`/courses/${courseId}/modules`, moduleData);
  return response.data;
};

/**
 * Adds a new lesson to a module. Restricted to the course INSTRUCTOR owner.
 *
 * @param {number|string} moduleId
 * @param {{ title: string, content: string }} lessonData
 * @returns {Promise<object>} created lesson object
 */
export const addLesson = async (moduleId, lessonData) => {
  const response = await client.post(`/modules/${moduleId}/lessons`, lessonData);
  return response.data;
};

/**
 * Uploads a local PDF or Video file for a lesson.
 *
 * @param {number|string} lessonId
 * @param {File} file
 * @param {string} mediaType - 'PDF' or 'VIDEO'
 * @returns {Promise<object>} updated lesson object
 */
export const uploadLessonMedia = async (lessonId, file, mediaType = 'PDF') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mediaType', mediaType);

  const response = await client.post(`/courses/lessons/${lessonId}/media`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};


