import webpush from 'web-push';
import { db } from '../db/index.js';
import { pushSubscriptions, notifications } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { getIO } from '../ws/index.js';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

// Configure VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@careerpilot.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

import { redis } from '../config/redis.js';

export class NotificationService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  /**
   * Orchestrates the entire notification flow with intelligent hybrid delivery:
   * 1. Persists to Database (always)
   * 2. Checks Redis for online status
   * 3. Sends via Socket if online
   * 4. Sends via Web Push if offline
   * 5. Sends via Email if requested
   */
  static async sendNotification(userId: string, type: string, message: string, options?: { email?: boolean, emailPayload?: { subject: string, html?: string } }) {
    // 1. Persist to Database (Source of Truth)
    const [notification] = await db.insert(notifications).values({
      userId,
      type,
      message,
    }).returning();

    // 2. Check Presence in Redis
    const status = await redis.get(`user:${userId}:status`);
    const isOnline = status === 'online';

    if (isOnline) {
      // 3. Real-time Delivery (Socket.io)
      try {
        const io = getIO();
        io.to(userId).emit('notification:new', notification);
        console.log(`Notification delivered via Socket to user: ${userId}`);
      } catch (err) {
        console.warn(`Socket delivery failed for user ${userId}, falling back to push.`);
        await this.triggerPush(userId, { title: 'CareerPilot Update', body: message });
      }
    } else {
      // 4. Offline Fallback (Web Push)
      console.log(`User ${userId} is offline. Sending via Web Push.`);
      await this.triggerPush(userId, { title: 'CareerPilot Update', body: message });
    }

    // 5. Email Delivery (Optional)
    if (options?.email && options.emailPayload) {
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId)
      });
      if (user?.email) {
        await this.sendEmail(user.email, options.emailPayload.subject, message, options.emailPayload.html);
      }
    }

    return notification;
  }

  static async sendEmail(to: string, subject: string, text: string, html?: string) {
    return await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
  }

  private static async triggerPush(userId: string, payload: { title: string, body: string }) {
    const subscriptions = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, userId),
    });

    const pushPromises = subscriptions.map(async (subRecord) => {
      try {
        await webpush.sendNotification(
          subRecord.subscription as any,
          JSON.stringify(payload)
        );
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription expired or invalid - remove from DB
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, subRecord.id));
        }
        console.error('Push delivery failed:', error);
      }
    });

    await Promise.allSettled(pushPromises);
  }

  static async saveSubscription(userId: string, subscription: any) {
    const [saved] = await db.insert(pushSubscriptions).values({
      userId,
      subscription,
    }).returning();
    return saved;
  }
}
