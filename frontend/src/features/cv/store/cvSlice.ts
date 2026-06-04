import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CVState {
  isUploaded: boolean;
  isProcessing: boolean;
  chunks: string[];
  uploadCV: (file: File) => Promise<void>;
  resetCV: () => void;
}

export const useCVStore = create<CVState>()(
  persist(
    (set) => ({
      isUploaded: false,
      isProcessing: false,
      chunks: [],
      uploadCV: async (file) => {
        set({ isProcessing: true });
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockChunks = [
          "Experienced software engineer with Python, JavaScript, React, Node.js.",
          "Worked at Google as a software engineering intern, developed ML models for recommendation systems.",
          "Education: BSc in Computer Science from BUET, CGPA 3.8.",
          "Projects: Built a RAG-based chatbot, e-commerce platform, and weather app."
        ];
        set({ isUploaded: true, isProcessing: false, chunks: mockChunks });
      },
      resetCV: () => set({ isUploaded: false, isProcessing: false, chunks: [] }),
    }),
    { name: 'cv-storage' }
  )
);
