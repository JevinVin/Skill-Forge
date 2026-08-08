import client from './client';

/**
 * Sends a query to the AI Assistant REST API.
 *
 * @param {{ question: string, courseTitle?: string, lessonTitle?: string, lessonContent?: string }} payload
 * @returns {Promise<{ answer: string, contextUsed: string, suggestedFollowUps: Array<string> }>}
 */
export const askAiTutor = async (payload) => {
  const response = await client.post('/ai/ask', payload);
  return response.data;
};
