import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Roadmap } from '../types/global'

interface RoadmapStore {
  roadmaps: Roadmap[]
  add: (r: Omit<Roadmap, 'id' | 'createdAt'>) => void
  remove: (id: string) => void
}

export const useRoadmapStore = create<RoadmapStore>()(
  persist(
    (set) => ({
      roadmaps: [],
      add: (r) => set(s => ({
        roadmaps: [{ ...r, id: crypto.randomUUID(), createdAt: Date.now() }, ...s.roadmaps],
      })),
      remove: (id) => set(s => ({ roadmaps: s.roadmaps.filter(r => r.id !== id) })),
    }),
    { name: 'cp-roadmaps' }
  )
)
