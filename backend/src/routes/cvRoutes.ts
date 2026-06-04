import { Router } from 'express';
import multer from 'multer';
import { handleUpload } from '../controllers/cvController.js';
import { authMiddleware } from '../middleware/auth.middleware.js'; // adjust path if needed

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authMiddleware, upload.single('cv'), handleUpload);
export default router;
