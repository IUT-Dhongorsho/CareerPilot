import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job } from '../../jobs/store/jobsSlice';
import * as trackerApi from '../services';

interface TrackerState {
  kanban: {
    wishlist: Job[];
    applied: Job[];
    interviewing: Job[];
    offer: Job[];
    rejected: Job[];
  };
  todos: {
    id: string;
    text: string;
    dueDate: string;
    completed: boolean;
  }[];
  calendarEvents: {
    id: string;
    title: string;
    date: string;
  }[];
  fetchKanban: () => Promise<void>;
  addToKanban: (job: Job, status: string) => Promise<void>;
  moveJob: (jobId: string, fromStatus: string, toStatus: string) => Promise<void>;
  reorderJobs: (status: string, newJobs: Job[]) => void;
  addTodo: (text: string, dueDate: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  removeTodo: (id: string) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      kanban: {
        wishlist: [],
        applied: [],
        interviewing: [],
        offer: [],
        rejected: [],
      },
      todos: [],
      calendarEvents: [],
      fetchKanban: async () => {
        try {
          const kanban = await trackerApi.getKanban();
          set({ kanban });
        } catch (error) {
          console.error('Failed to fetch kanban:', error);
        }
      },
      addToKanban: async (job, status) => {
        try {
          // 1. Optimistic update or just wait for backend
          const savedJob = await trackerApi.addToKanban(job, status);
          
          // Use the job title/company from the passed job if backend returns different structure
          // but mostly we want the new ID.
          const jobWithId = { ...job, id: (savedJob as any).id || job.id };

          set((state) => {
            const newKanban = { ...state.kanban };
            const column = newKanban[status as keyof typeof newKanban];
            if (!column) return state;
            
            newKanban[status as keyof typeof newKanban] = [...column, jobWithId];
            
            let newCalendarEvents = [...state.calendarEvents];
            if (jobWithId.deadline && !newCalendarEvents.some(e => e.id === jobWithId.id)) {
              newCalendarEvents.push({ id: jobWithId.id, title: `${jobWithId.title} deadline`, date: jobWithId.deadline });
            }

            return { 
              kanban: newKanban,
              calendarEvents: newCalendarEvents
            };
          });
        } catch (error) {
          console.error('Failed to add to kanban:', error);
        }
      },
      moveJob: async (jobId, from, to) => {
        try {
          await trackerApi.moveJob(jobId, from, to);
          set((state) => {
            const job = state.kanban[from as keyof typeof state.kanban]?.find((j) => j.id === jobId);
            if (!job) return state;
            const newFrom = state.kanban[from as keyof typeof state.kanban].filter((j) => j.id !== jobId);
            const newTo = [...state.kanban[to as keyof typeof state.kanban], job];
            return {
              kanban: {
                ...state.kanban,
                [from]: newFrom,
                [to]: newTo,
              },
            };
          });
        } catch (error) {
          console.error('Failed to move job:', error);
        }
      },
      reorderJobs: (column, newJobs) =>
        set((state) => ({
          kanban: {
            ...state.kanban,
            [column]: newJobs,
          },
        })),
      addTodo: (text, dueDate) =>
        set((state) => ({
          todos: [...state.todos, { id: Date.now().toString(), text, dueDate, completed: false }],
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        })),
      removeTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        })),
    }),
    { 
      name: 'tracker-storage',
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...(persistedState || {}),
        kanban: {
          wishlist: [],
          applied: [],
          interviewing: [],
          offer: [],
          rejected: [],
          ...(persistedState?.kanban || {}),
        },
      }),
    }
  )
);
