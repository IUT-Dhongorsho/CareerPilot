import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoadmapState {
  roadmapHtml: string | null;
  setRoadmap: (html: string) => void;
  clearRoadmap: () => void;
}

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set) => ({
      roadmapHtml: null,
      setRoadmap: (html) => set({ roadmapHtml: html }),
      clearRoadmap: () => set({ roadmapHtml: null }),
    }),
    { name: 'roadmap-storage' }
  )
);
