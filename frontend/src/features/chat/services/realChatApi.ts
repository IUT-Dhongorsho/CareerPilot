import axios from '../../../lib/api/axiosClient';
import type { Message } from '../types';

/**
 * Sends a message to the backend via REST API (fallback/initial)
 * Note: Most communication happens via WebSockets in useChatSocket
 */
export const sendMessageReal = async (message: string, cvChunks: string[]): Promise<any> => {
  // Placeholder: align with sendMessage signature to fix build
  return await axios.post<any>(`/chat/sessions`, { content: message, chunks: cvChunks });
};

/**
 * Fetches chat history for a session
 */
export const getChatHistory = async (sessionId: string): Promise<Message[]> => {
  return await axios.get<Message[]>(`/chat/sessions/${sessionId}/history`);
};
