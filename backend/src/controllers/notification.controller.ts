import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { db } from '../db';
import { notifications } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export class NotificationController {
  static getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;

    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: [desc(notifications.createdAt)],
    });

    sendSuccess(res, userNotifications, 'Notifications retrieved successfully');
  });

  static markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();

    sendSuccess(res, updated, 'Notification marked as read');
  });

  static markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    sendSuccess(res, null, 'All notifications marked as read');
  });
}
