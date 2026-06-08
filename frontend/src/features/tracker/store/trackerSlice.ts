import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job } from '../../jobs/store/jobsSlice';

interface TrackerState {
  kanban: {
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
  addToKanban: (job: Job, status: string) => void;
  moveJobBetweenColumns: (jobId: string, fromStatus: string, toStatus: string) => void;
  reorderJobsInColumn: (status: string, newJobs: Job[]) => void;
  addTodo: (text: string, dueDate: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  updateCalendarEvents: () => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      kanban: { applied: [], interviewing: [], offer: [], rejected: [] },
      todos: [],
      calendarEvents: [],

      addToKanban: (job, status) => {
        set((state) => {
          const newKanban = { ...state.kanban };
          newKanban[status as keyof typeof newKanban] = [...newKanban[status as keyof typeof newKanban], job];
          return { kanban: newKanban };
        });
        // Also add a calendar event for the deadline
        if (job.deadline) {
          set((state) => ({
            calendarEvents: [
              ...state.calendarEvents,
              { id: job.id, title: `${job.title} deadline`, date: job.deadline },
            ],
          }));
        }
        // Add a todo item for this job
        get().addTodo(`Apply to ${job.title} at ${job.company}`, job.deadline);
      },

      moveJobBetweenColumns: (jobId, fromStatus, toStatus) => {
        set((state) => {
          const fromJobs = state.kanban[fromStatus as keyof typeof state.kanban];
          const job = fromJobs.find(j => j.id === jobId);
          if (!job) return state;
          const newFrom = fromJobs.filter(j => j.id !== jobId);
          const newTo = [...state.kanban[toStatus as keyof typeof state.kanban], job];
          return {
            kanban: {
              ...state.kanban,
              [fromStatus]: newFrom,
              [toStatus]: newTo,
            },
          };
        });
      },

      reorderJobsInColumn: (status, newJobs) => {
        set((state) => ({
          kanban: {
            ...state.kanban,
            [status]: newJobs,
          },
        }));
      },

      addTodo: (text, dueDate) => {
        set((state) => ({
          todos: [
            ...state.todos,
            {
              id: Date.now().toString(),
              text,
              dueDate: dueDate || new Date().toISOString().split('T')[0],
              completed: false,
            },
          ],
        }));
      },

      toggleTodo: (id) => {
        set((state) => ({
          todos: state.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ),
        }));
      },

      removeTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter(todo => todo.id !== id),
        }));
      },

      updateCalendarEvents: () => {
        const state = get();
        const events = [
          ...state.kanban.applied.map(job => ({ id: job.id, title: `${job.title} deadline`, date: job.deadline })),
          ...state.kanban.interviewing.map(job => ({ id: job.id, title: `${job.title} deadline`, date: job.deadline })),
          ...state.kanban.offer.map(job => ({ id: job.id, title: `${job.title} deadline`, date: job.deadline })),
          ...state.kanban.rejected.map(job => ({ id: job.id, title: `${job.title} deadline`, date: job.deadline })),
          ...state.todos.map(todo => ({ id: todo.id, title: todo.text, date: todo.dueDate })),
        ].filter(e => e.date);
        set({ calendarEvents: events });
      },
    }),
    {
      name: 'tracker-storage',
    }
  )
);
