import { v4 as uuidv4 } from 'uuid';
import { redis } from '../../config/redis.js';

const SESSION_TTL = 7200; // 1 hour in seconds

export interface InterviewSession {
  userId: string;
  jobTitle: string;
  jobDescription: string;
  questionsAsked: string[];
  currentQuestionIndex: number;
  answers: string[];
  createdAt: number;
}

export async function createSession(userId: string, jobTitle: string, jobDescription: string): Promise<string> {
  const sessionId = uuidv4();
  const session: InterviewSession = {
    userId,
    jobTitle,
    jobDescription,
    questionsAsked: [],
    currentQuestionIndex: 0,
    answers: [],
    createdAt: Date.now(),
  };
  await redis.setex(`interview:${sessionId}`, SESSION_TTL, JSON.stringify(session));
  return sessionId;
}

export async function getSession(sessionId: string): Promise<InterviewSession | null> {
  const data = await redis.get(`interview:${sessionId}`);
  return data ? JSON.parse(data) : null;
}

export async function updateSession(sessionId: string, updates: Partial<InterviewSession>): Promise<void> {
  const session = await getSession(sessionId);
  if (session) {
    Object.assign(session, updates);
    await redis.setex(`interview:${sessionId}`, SESSION_TTL, JSON.stringify(session));
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  await redis.del(`interview:${sessionId}`);
}
