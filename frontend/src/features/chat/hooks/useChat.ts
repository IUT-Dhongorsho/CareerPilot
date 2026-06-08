import { useEffect } from 'react';
import { useChatStore } from '../store/chatSlice';
import { useChatSocket } from './useChatSocket';
import axios from '../../../lib/api/axiosClient';

export const useChat = () => {
  const { messages, isLoading, currentSessionId, setSessionId, setLoading, addMessage } = useChatStore();
  const { sendMessage: sendSocketMessage } = useChatSocket(currentSessionId);
  // Unused setResults removed

  useEffect(() => {
    const initSession = async () => {
      if (currentSessionId) return;
      try {
        const sessions = await axios.get<any[]>('/chat/sessions');
        if (sessions && sessions.length > 0) {
          setSessionId(sessions[0].id);
        } else {
          const newSession = await axios.post<any>('/chat/sessions', { title: 'Career Chat' });
          if (newSession && newSession.id) {
            setSessionId(newSession.id);
          }
        }
      } catch (error) {
        console.error('Failed to init chat session:', error);
      }
    };
    initSession();
  }, [currentSessionId, setSessionId]);

  const sendUserMessage = async (text: string) => {
    if (!text.trim() || !currentSessionId) return;
    
    // Check if the mock API is used, if so, fallback to manual adding for UI purposes
    // but the actual socket will handle it. Wait, if mock is on, socket won't respond.
    const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
    if (USE_MOCK) {
      addMessage({ role: 'user', content: text });
      setLoading(true);
      setTimeout(() => {
        addMessage({ role: 'assistant', content: 'Mock response from unified hook.' });
        setLoading(false);
      }, 1000);
      return;
    }

    sendSocketMessage(text);
  };

  return { messages, sendMessage: sendUserMessage, isLoading };
};
