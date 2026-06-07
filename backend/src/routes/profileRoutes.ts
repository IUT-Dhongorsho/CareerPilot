import { Router } from 'express';
import { extractProfile, analyzeCV } from '../controllers/profileController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/profile', authMiddleware, extractProfile);
router.post('/analyze', authMiddleware, analyzeCV);
export default router;
