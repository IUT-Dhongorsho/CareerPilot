import { v4 as uuidv4 } from 'uuid';

interface InterviewSession {
  userId: string;
  jobTitle: string;
  jobDescription: string;
  questionsAsked: string[];
  currentQuestionIndex: number;
  answers: string[];
  createdAt: number;
}

const sessions = new Map<string, InterviewSession>();

export function createSession(userId: string, jobTitle: string, jobDescription: string): string {
  const sessionId = uuidv4();
  sessions.set(sessionId, {
    userId,
    jobTitle,
    jobDescription,
    questionsAsked: [],
    currentQuestionIndex: 0,
    answers: [],
    createdAt: Date.now(),
  });
  // Auto-clean after 1 hour
  setTimeout(() => sessions.delete(sessionId), 60 * 60 * 1000);
  return sessionId;
}

export function getSession(sessionId: string): InterviewSession | undefined {
  return sessions.get(sessionId);
}

export function updateSession(sessionId: string, updates: Partial<InterviewSession>) {
  const session = sessions.get(sessionId);
  if (session) {
    Object.assign(session, updates);
    sessions.set(sessionId, session);
  }
}
