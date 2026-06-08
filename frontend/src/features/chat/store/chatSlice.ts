import { create } from 'zustand';
import type { Message } from '../types';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentSessionId: string | null;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setSessionId: (id: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  currentSessionId: null,
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now().toString(),
          timestamp: new Date(),
          ...message,
        },
      ],
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setSessionId: (id) => set({ currentSessionId: id }),
  clearMessages: () => set({ messages: [] }),
}));
