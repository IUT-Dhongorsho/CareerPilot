import { Router } from 'express';
import { getSessions, getHistory, createSession } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/sessions', authMiddleware, getSessions);
router.get('/sessions/:sessionId/history', authMiddleware, getHistory);
router.post('/sessions', authMiddleware, createSession);

export default router;
