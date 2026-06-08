import axiosClient from '../../../lib/api/axiosClient';
import type { Job } from '../../jobs/store/jobsSlice';

export const getKanbanReal = async () => {
  const res = await axiosClient.get('/tracker/kanban');
  return res.data;
};

export const addToKanbanReal = async (job: Job, status: string) => {
  await axiosClient.post('/tracker/kanban', { job, status });
};

export const moveJobReal = async (jobId: string, fromStatus: string, toStatus: string) => {
  await axiosClient.put('/tracker/kanban/move', { jobId, fromStatus, toStatus });
};

export const getTodosReal = async () => {
  const res = await axiosClient.get('/tracker/todos');
  return res.data.todos;
};

export const addTodoReal = async (text: string, dueDate: string) => {
  const res = await axiosClient.post('/tracker/todos', { text, dueDate });
  return res.data.id;
};

export const toggleTodoReal = async (id: string, completed: boolean) => {
  await axiosClient.put(`/tracker/todos/${id}`, { completed });
};

export const getCalendarEventsReal = async () => {
  const res = await axiosClient.get('/tracker/calendar');
  return res.data.events;
};
