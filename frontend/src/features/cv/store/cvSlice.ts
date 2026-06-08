import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CVState {
  isUploaded: boolean;
  isProcessing: boolean;
  chunks: string[];
  setProcessing: (processing: boolean) => void;
  uploadCV: () => Promise<void>;
  resetCV: () => void;
}

export const useCVStore = create<CVState>()(
  persist(
    (set) => ({
      isUploaded: false,
      isProcessing: false,
      chunks: [],
      setProcessing: (processing) => set({ isProcessing: processing }),
      uploadCV: async () => {
        set({ isUploaded: true, isProcessing: false });
      },
      resetCV: () => set({ isUploaded: false, isProcessing: false, chunks: [] }),
    }),
    { name: 'cv-storage' }
  )
);
