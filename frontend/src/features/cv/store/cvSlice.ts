import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CVState {
  isUploaded: boolean;
  isProcessing: boolean;
  chunks: string[];
  setProcessing: (processing: boolean) => void;
  setUploaded: (status: boolean) => void;
  setChunks: (chunks: string[]) => void;
  uploadCV: (file?: File) => Promise<void>;
  resetCV: () => void;
}

export const useCVStore = create<CVState>()(
  persist(
    (set) => ({
      isUploaded: false,
      isProcessing: false,
      chunks: [],
      setProcessing: (processing) => set({ isProcessing: processing }),
      setUploaded: (status) => set({ isUploaded: status }),
      setChunks: (chunks) => set({ chunks }),
      uploadCV: async (file) => {
        set({ isProcessing: true });
        // Simulating processing if file is provided, otherwise just marking as done
        if (file) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        set({ isUploaded: true, isProcessing: false });
      },
      resetCV: () => set({ isUploaded: false, isProcessing: false, chunks: [] }),
    }),
    { name: 'cv-storage' }
  )
);
