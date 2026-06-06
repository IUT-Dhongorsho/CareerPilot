import { Router } from 'express';
import {
  getKanban, addToKanban, moveJob, reorderJobs,
  getTodos, addTodo, toggleTodo,
  getCalendarEvents,
} from '../controllers/trackerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

// Kanban
router.get('/kanban', getKanban);
router.post('/kanban', addToKanban);
router.put('/kanban/move', moveJob);
router.put('/kanban/reorder', reorderJobs);

// Todos
router.get('/todos', getTodos);
router.post('/todos', addTodo);
router.put('/todos/:id', toggleTodo);

// Calendar
router.get('/calendar', getCalendarEvents);

export default router;
