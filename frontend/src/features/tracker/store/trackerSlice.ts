import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job } from '../../jobs/store/jobsSlice';
import { addToKanban, moveJob, addTodo, toggleTodo } from '../services';

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
  addToKanban: (job: Job, status: string) => Promise<void>;
  moveJob: (jobId: string, fromStatus: string, toStatus: string, jobTitle?: string) => Promise<void>;
  reorderJobs: (status: string, newJobs: Job[]) => void;
  addTodo: (text: string, dueDate: string) => Promise<void>;
  toggleTodo: (id: string, text?: string) => Promise<void>;
  removeTodo: (id: string) => void;
  setKanban: (kanban: any) => void;
  setTodos: (todos: any[]) => void;
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
      
      setKanban: (kanban) => set({ kanban }),
      setTodos: (todos) => set({ todos }),

      addToKanban: async (job, status) => {
        try {
          await addToKanban(job, status);
          set((state) => {
            const newKanban = { ...state.kanban };
            const column = newKanban[status as keyof typeof newKanban];
            if (!column) return state;
            if (column.some(j => j.id === job.id)) return state;
            
            newKanban[status as keyof typeof newKanban] = [...column, { ...job, createdAt: new Date().toISOString() }];
            
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
        } catch (error) {
          console.error('Failed to add to kanban:', error);
        }
      },

      moveJob: async (jobId, from, to, jobTitle) => {
        try {
          await moveJob(jobId, to, jobTitle);
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

      addTodo: async (text, dueDate) => {
        try {
          const res = await addTodo(text, dueDate);
          set((state) => ({
            todos: [...state.todos, { id: res.id || Date.now().toString(), text, dueDate, completed: false }],
          }));
        } catch (error) {
          console.error('Failed to add todo:', error);
        }
      },

      toggleTodo: async (id, text) => {
        set((state) => {
          const todo = state.todos.find(t => t.id === id);
          if (!todo) return state;
          const newCompleted = !todo.completed;
          
          // Async call to backend
          toggleTodo(id, newCompleted, text || todo.text).catch(err => console.error('Sync error:', err));
          
          return {
            todos: state.todos.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)),
          };
        });
      },

      removeTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        })),
    }),
    { name: 'tracker-storage' }
  )
);
