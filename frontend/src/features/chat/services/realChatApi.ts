import axios from '../../../lib/api/axiosClient';
import { ChatMessage } from '../types';

/**
 * Sends a message to the backend via REST API (fallback/initial)
 * Note: Most communication happens via WebSockets in useChatSocket
 */
export const sendMessageReal = async (sessionId: string, content: string): Promise<ChatMessage> => {
  return await axios.post<ChatMessage>(`/chat/sessions/${sessionId}/messages`, { content });
};

/**
 * Fetches chat history for a session
 */
export const getChatHistory = async (sessionId: string): Promise<ChatMessage[]> => {
  return await axios.get<ChatMessage[]>(`/chat/sessions/${sessionId}/history`);
};
