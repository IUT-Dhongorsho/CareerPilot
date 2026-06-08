import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosClient from '../../../lib/api/axiosClient';

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
        try {
          const formData = new FormData();
          formData.append('cv', file);
          // Make real API call to backend
          const response = await axiosClient.post('/cv/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (response.data.success) {
            // For now, we don't have chunks from backend; we can fetch them later
            set({ isUploaded: true, isProcessing: false, chunks: [] });
          } else {
            throw new Error('Upload failed');
          }
        } catch (error) {
          console.error('CV upload error:', error);
          set({ isProcessing: false });
          throw error;
        }
      },
      resetCV: () => set({ isUploaded: false, isProcessing: false, chunks: [] }),
    }),
    { name: 'cv-storage' }
  )
);
