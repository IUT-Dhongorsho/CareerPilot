import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import axiosClient from '../../../lib/api/axiosClient';
import type { Job } from '../../jobs/store/jobsSlice';

interface KanbanState {
  wishlist: Job[];
  applied: Job[];
  interviewing: Job[];
  offer: Job[];
  rejected: Job[];
}

interface TrackerState {
  kanban: KanbanState;
  todos: any[];
  calendarEvents: any[];
  isLoading: boolean;
  fetchKanban: () => Promise<void>;
  addToKanban: (job: Job, status: string) => Promise<void>;
  moveJob: (jobId: string, fromStatus: string, toStatus: string) => Promise<void>;
  reorderJobs: (status: string, newJobs: Job[]) => void;
  addTodo: (text: string, dueDate: string) => Promise<void>;
  toggleTodo: (id: string, completed: boolean) => Promise<void>;
}

const initialState: TrackerState = {
  kanban: { wishlist: [], applied: [], interviewing: [], offer: [], rejected: [] },
  todos: [],
  calendarEvents: [],
  isLoading: false,
};

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      ...initialState,
      fetchKanban: async () => {
        console.log('Fetching Kanban...');
        set({ isLoading: true });
        try {
          const res = await axiosClient.get('/tracker/kanban');
          // Backend returns the kanban object directly
          console.log('Kanban response:', res.data);
          set({ kanban: res.data });
        } catch (error) {
          console.error('Failed to fetch Kanban:', error);
          toast.error('Failed to load Kanban');
        } finally {
          set({ isLoading: false });
        }
      },
      addToKanban: async (job, status) => {
        console.log('Adding to Kanban:', job, status);
        try {
          await axiosClient.post('/tracker/kanban', { job, status });
          toast.success(`Added "${job.title}" to ${status}`);
          await get().fetchKanban();
          // Also update calendar and todos locally
          set((state) => ({
            calendarEvents: [...state.calendarEvents, { id: job.id, title: `${job.title} deadline`, date: job.deadline }],
            todos: [...state.todos, { id: Date.now().toString(), text: `Apply to ${job.title} at ${job.company}`, dueDate: job.deadline, completed: false }]
          }));
        } catch (error) {
          console.error('Add to Kanban error:', error);
          toast.error('Failed to add job');
        }
      },
      moveJob: async (jobId, fromStatus, toStatus) => {
        try {
          await axiosClient.put('/tracker/kanban/move', { jobId, toStatus });
          toast.success(`Moved to ${toStatus}`);
          await get().fetchKanban();
        } catch (error) {
          console.error('Move error:', error);
          toast.error('Move failed');
        }
      },
      reorderJobs: (status, newJobs) => {
        set((state) => ({
          kanban: { ...state.kanban, [status]: newJobs }
        }));
      },
      addTodo: async (text, dueDate) => {
        try {
          await axiosClient.post('/tracker/todos', { text, dueDate });
          toast.success('Todo added');
          // Optionally refresh todos
        } catch (error) {
          toast.error('Failed to add todo');
        }
      },
      toggleTodo: async (id, completed) => {
        try {
          await axiosClient.put(`/tracker/todos/${id}`, { completed });
          set((state) => ({ todos: state.todos.map(t => t.id === id ? { ...t, completed } : t) }));
        } catch (error) {
          toast.error('Update failed');
        }
      },
    }),
    { name: 'tracker-storage' }
  )
);
