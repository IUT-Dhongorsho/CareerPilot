import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { chatSessions } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { getHistory as getChatHistory, processMessage } from '../services/chat/chat.service.js';

export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const sessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.createdAt));

    res.json(sessions);
  } catch (error) {
    console.error('[ChatController] Error in getSessions:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify session belongs to user
    const session = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId as any))
      .limit(1);

    if (session.length === 0 || session[0].userId !== userId) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    const history = await getChatHistory(sessionId as string);
    res.json(history);
  } catch (error) {
    console.error('[ChatController] Error in getHistory:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { title } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const [newSession] = await db
      .insert(chatSessions)
      .values({
        userId,
        title: title || 'New Chat',
      })
      .returning();

    res.json(newSession);
  } catch (error) {
    console.error('[ChatController] Error in createSession:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { sessionId } = req.params;
    const { content } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!content) return res.status(400).json({ error: 'Message content is required' });

    const session = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId as any))
      .limit(1);

    if (session.length === 0 || session[0].userId !== userId) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    const responseContent = await processMessage(userId, sessionId as string, content);
    
    res.json({
      role: 'assistant',
      content: responseContent,
    });
  } catch (error) {
    console.error('[ChatController] Error in sendMessage:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};
