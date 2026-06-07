import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware';
import cvRoutes from './routes/cvRoutes.js';
import jobsRoutes from './routes/jobsRoutes.js';
import authRoutes from './routes/auth.routes';
import notificationRoutes from './routes/notification.routes';
import trackerRoutes from './routes/trackerRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/cv', profileRoutes);
app.use('/api/interview', interviewRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;
