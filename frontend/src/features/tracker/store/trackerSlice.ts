import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job } from '../../jobs/store/jobsSlice';

interface TrackerState {
  kanban: { applied: Job[]; interviewing: Job[]; offer: Job[]; rejected: Job[] };
  todos: { id: string; text: string; dueDate: string; completed: boolean }[];
  calendarEvents: { id: string; title: string; date: string }[];
  addToKanban: (job: Job, status: string) => void;
  moveJobBetweenColumns: (jobId: string, from: string, to: string) => void;
  reorderJobsInColumn: (column: string, newJobs: Job[]) => void;
  addTodo: (todo: { text: string; dueDate: string }) => void;
  toggleTodo: (id: string) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      kanban: { applied: [], interviewing: [], offer: [], rejected: [] },
      todos: [],
      calendarEvents: [],
      addToKanban: (job, status) =>
        set((state) => {
          const newKanban = { ...state.kanban };
          newKanban[status as keyof typeof newKanban] = [...newKanban[status as keyof typeof newKanban], job];
          return {
            kanban: newKanban,
            calendarEvents: [
              ...state.calendarEvents,
              { id: job.id, title: `${job.title} deadline`, date: job.deadline },
            ],
            todos: [
              ...state.todos,
              { id: Date.now().toString(), text: `Apply to ${job.title} at ${job.company}`, dueDate: job.deadline, completed: false },
            ],
          };
        }),
      moveJobBetweenColumns: (jobId, from, to) =>
        set((state) => {
          const job = state.kanban[from as keyof typeof state.kanban].find((j) => j.id === jobId);
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
        }),
      reorderJobsInColumn: (column, newJobs) =>
        set((state) => ({
          kanban: {
            ...state.kanban,
            [column]: newJobs,
          },
        })),
      addTodo: (todo) =>
        set((state) => ({
          todos: [...state.todos, { id: Date.now().toString(), completed: false, ...todo }],
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        })),
    }),
    { name: 'tracker-storage' }
  )
);
