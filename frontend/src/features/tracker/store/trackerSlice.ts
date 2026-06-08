import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job } from '../../jobs/store/jobsSlice';

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
  addToKanban: (job: Job, status: string) => void;
  moveJob: (jobId: string, fromStatus: string, toStatus: string) => void;
  reorderJobs: (status: string, newJobs: Job[]) => void;
  addTodo: (text: string, dueDate: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      kanban: {
        wishlist: [],
        applied: [],
        interviewing: [],
        offer: [],
        rejected: [],
      },
      todos: [],
      calendarEvents: [],
      addToKanban: (job, status) => {
        set((state) => {
          const newKanban = { ...state.kanban };
          const column = newKanban[status as keyof typeof newKanban];
          if (!column) return state;
          if (column.some(j => j.id === job.id)) return state;
          
          newKanban[status as keyof typeof newKanban] = [...column, job];
          
          let newCalendarEvents = [...state.calendarEvents];
          if (job.deadline && !newCalendarEvents.some(e => e.id === job.id)) {
            newCalendarEvents.push({ id: job.id, title: `${job.title} deadline`, date: job.deadline });
          }

          let newTodos = [...state.todos];
          if (status === 'wishlist' || status === 'applied') {
             newTodos.push({ 
               id: Date.now().toString(), 
               text: `Apply to ${job.title} at ${job.company}`, 
               dueDate: job.deadline || '', 
               completed: false 
             });
          }

          return { 
            kanban: newKanban,
            calendarEvents: newCalendarEvents,
            todos: newTodos
          };
        });
      },
      moveJob: (jobId, from, to) =>
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
        }),
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
    { name: 'tracker-storage' }
  )
);
