import { Request, Response } from 'express';
import { supabase } from '../utils/supabase-client.js';

const getUserId = (req: Request) => (req as any).user?.id;

// ---------- Kanban ----------
export const getKanban = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase.from('kanban_items').select('*').eq('user_id', userId);
  if (error) return res.status(500).json({ error: error.message });
  const result = { wishlist: [], applied: [], interviewing: [], offer: [], rejected: [] };
  data.forEach((item: any) => {
    ((result as any)[item.status]).push(item);
  });
  res.json(result);
};

export const addToKanban = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { job, status } = req.body;
  if (!job || !status) return res.status(400).json({ error: 'Missing job or status' });
  const { error } = await supabase.from('kanban_items').insert({
    user_id: userId,
    job_id: job.id,
    job_title: job.title,
    job_description: job.description,
    company: job.company,
    salary: job.salary,
    deadline: job.deadline,
    status,
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
};

export const moveJob = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { jobId, toStatus } = req.body;
  if (!jobId || !toStatus) return res.status(400).json({ error: 'Missing jobId or toStatus' });
  const { error } = await supabase.from('kanban_items').update({ status: toStatus }).eq('id', jobId).eq('user_id', userId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
};

export const reorderJobs = async (req: Request, res: Response) => {
  res.json({ success: true });
};

// ---------- Todos ----------
export const getTodos = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase.from('todos').select('*').eq('user_id', userId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ todos: data });
};

export const addTodo = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { text, dueDate } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text' });
  const { data, error } = await supabase.from('todos').insert({ user_id: userId, text, due_date: dueDate }).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data[0].id });
};

export const toggleTodo = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const { completed } = req.body;
  const { error } = await supabase.from('todos').update({ completed }).eq('id', id).eq('user_id', userId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
};

// ---------- Calendar ----------
export const getCalendarEvents = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { data: kanban, error: e1 } = await supabase.from('kanban_items').select('id, job_title, deadline').eq('user_id', userId);
  const { data: todos, error: e2 } = await supabase.from('todos').select('id, text, due_date').eq('user_id', userId);
  if (e1 || e2) return res.status(500).json({ error: 'Failed to fetch events' });
  const events = [
    ...(kanban || []).map(k => ({ id: k.id, title: `${k.job_title} deadline`, date: k.deadline })),
    ...(todos || []).map(t => ({ id: t.id, title: t.text, date: t.due_date })),
  ].filter(e => e.date);
  res.json({ events });
};
