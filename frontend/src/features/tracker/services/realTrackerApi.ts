import axiosClient from '../../../lib/api/axiosClient';

export const getKanbanReal = async () => {
  const res: any = await axiosClient.get('/tracker/kanban');
  return res;
};

export const addToKanbanReal = async (job: any, status: string) => {
  await axiosClient.post('/tracker/kanban', { job, status });
};

export const moveJobReal = async (jobId: string, toStatus: string, jobTitle?: string) => {
  await axiosClient.put('/tracker/kanban/move', { jobId, toStatus, jobTitle });
};

export const getTodosReal = async () => {
  const res: any = await axiosClient.get('/tracker/todos');
  return res.todos;
};

export const addTodoReal = async (text: string, dueDate: string) => {
  const res: any = await axiosClient.post('/tracker/todos', { text, dueDate });
  return res;
};

export const toggleTodoReal = async (id: string, completed: boolean, text?: string) => {
  await axiosClient.put(`/tracker/todos/${id}`, { completed, text });
};

export const getCalendarEventsReal = async () => {
  const res: any = await axiosClient.get('/tracker/calendar');
  return res.events;
};

