import client from './client';

/**
 * Quiz API calls.
 * Separated from UI components per code-generation-guide rules.
 */

/**
 * Fetches the quiz for a given course (correct answer flags hidden).
 *
 * @param {number|string} courseId
 * @returns {Promise<{ id: number, title: string, description: string, totalQuestions: number, questions: Array }>}
 */
export const fetchQuizByCourseId = async (courseId) => {
  const response = await client.get(`/courses/${courseId}/quiz`);
  return response.data;
};

/**
 * Submits quiz answers for scoring.
 *
 * @param {number|string} courseId
 * @param {Object<number, number>} answersMap - Map of questionId -> selectedOptionId
 * @returns {Promise<{ submissionId: number, score: number, totalQuestions: number, percentage: number, questionResults: Array }>}
 */
export const submitQuiz = async (courseId, answersMap) => {
  const response = await client.post(`/courses/${courseId}/quiz/submit`, {
    answers: answersMap,
  });
  return response.data;
};

/**
 * Creates a new quiz for a course. Restricted to the course INSTRUCTOR owner.
 *
 * @param {number|string} courseId
 * @param {{ title: string, description?: string }} quizData
 * @returns {Promise<object>} created quiz object
 */
export const createQuiz = async (courseId, quizData) => {
  const response = await client.post(`/courses/${courseId}/quiz`, quizData);
  return response.data;
};

/**
 * Adds a new question with answer choices to a course quiz. Restricted to INSTRUCTOR owner.
 *
 * @param {number|string} courseId
 * @param {{ text: string, options: Array<{ text: string, correct: boolean }> }} questionData
 * @returns {Promise<object>} updated quiz object
 */
export const addQuestion = async (courseId, questionData) => {
  const response = await client.post(`/courses/${courseId}/quiz/questions`, questionData);
  return response.data;
};

/**
 * Deletes the quiz for a course. Restricted to INSTRUCTOR owner.
 *
 * @param {number|string} courseId
 * @returns {Promise<void>}
 */
export const deleteQuiz = async (courseId) => {
  await client.delete(`/courses/${courseId}/quiz`);
};

/**
 * Deletes a specific question from a course quiz. Restricted to INSTRUCTOR owner.
 *
 * @param {number|string} courseId
 * @param {number|string} questionId
 * @returns {Promise<object>} updated quiz object
 */
export const deleteQuestion = async (courseId, questionId) => {
  const response = await client.delete(`/courses/${courseId}/quiz/questions/${questionId}`);
  return response.data;
};

/**
 * Updates an existing question and its options. Restricted to INSTRUCTOR owner.
 *
 * @param {number|string} courseId
 * @param {number|string} questionId
 * @param {{ text: string, options: Array<{ text: string, correct: boolean }> }} questionData
 * @returns {Promise<object>} updated quiz object
 */
export const updateQuestion = async (courseId, questionId, questionData) => {
  const response = await client.put(`/courses/${courseId}/quiz/questions/${questionId}`, questionData);
  return response.data;
};

/**
 * Imports questions in bulk from an uploaded CSV or JSON file. Restricted to INSTRUCTOR owner.
 *
 * @param {number|string} courseId
 * @param {File} file - .csv or .json file
 * @returns {Promise<object>} updated quiz object with imported questions
 */
export const importQuizFile = async (courseId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await client.post(`/courses/${courseId}/quiz/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ── Module Quiz APIs ─────────────────────────────────────────────────────────

export const fetchModuleQuiz = async (moduleId) => {
  const response = await client.get(`/modules/${moduleId}/quiz`);
  return response.data;
};

export const createModuleQuiz = async (moduleId, quizData) => {
  const response = await client.post(`/modules/${moduleId}/quiz`, quizData);
  return response.data;
};

export const submitModuleQuiz = async (moduleId, answers) => {
  const response = await client.post(`/modules/${moduleId}/quiz/submit`, { answers });
  return response.data;
};

export const importModuleQuizFile = async (moduleId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await client.post(`/modules/${moduleId}/quiz/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};





