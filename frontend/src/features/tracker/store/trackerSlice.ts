import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job } from '../../jobs/store/jobsSlice';

interface TrackerState {
  kanban: { applied: Job[]; interviewing: Job[]; offer: Job[]; rejected: Job[] };
  todos: any[];
  calendarEvents: any[];
  addToKanban: (job: Job, status: string) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      kanban: { applied: [], interviewing: [], offer: [], rejected: [] },
      todos: [],
      calendarEvents: [],
      addToKanban: (job, status) => {
        set((state) => ({
          kanban: {
            ...state.kanban,
            [status]: [...state.kanban[status as keyof typeof state.kanban], job],
          },
        }));
      },
    }),
    { name: 'tracker-storage' }
  )
);
