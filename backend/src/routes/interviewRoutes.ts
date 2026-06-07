import { Router } from 'express';
import { startInterview, answerQuestion, getSessionState } from '../controllers/interviewController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/start', authMiddleware, startInterview);
router.post('/answer', authMiddleware, answerQuestion);
router.get('/state/:sessionId', authMiddleware, getSessionState);
export default router;
