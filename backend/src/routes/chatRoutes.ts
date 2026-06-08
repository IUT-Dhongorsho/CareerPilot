import { Router } from 'express';
import { getSessions, getHistory, createSession, sendMessage } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/sessions', authMiddleware, getSessions);
router.get('/sessions/:sessionId/history', authMiddleware, getHistory);
router.post('/sessions', authMiddleware, createSession);
router.post('/sessions/:sessionId/messages', authMiddleware, sendMessage);

export default router;
