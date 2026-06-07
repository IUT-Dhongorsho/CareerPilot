import { Router } from 'express';
import { searchJobs } from '../controllers/jobsController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/search', authMiddleware, searchJobs);
export default router;
