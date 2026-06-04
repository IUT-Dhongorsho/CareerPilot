import webpush from 'web-push';
import { db } from '../db';
import { pushSubscriptions, notifications } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getIO } from '../ws';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

// Configure VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@careerpilot.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

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
   * Orchestrates the entire notification flow: DB -> Socket -> Push -> Email (Optional)
   */
  static async sendNotification(userId: string, type: string, message: string, options?: { email?: boolean, emailPayload?: { subject: string, html?: string } }) {
    // 1. Persist to Database
    const [notification] = await db.insert(notifications).values({
      userId,
      type,
      message,
    }).returning();

    // 2. Real-time Delivery (Socket.io)
    try {
      const io = getIO();
      io.to(userId).emit('notification:new', notification);
    } catch (err) {
      console.warn(`Socket notification skipped for user ${userId}: Server not ready.`);
    }

    // 3. Web Push Delivery (VAPID)
    await this.triggerPush(userId, { title: 'CareerPilot Update', body: message });

    // 4. Email Delivery (Optional)
    if (options?.email && options.emailPayload) {
      // We assume user email is fetched or passed. For now, fetch from local users table.
      const user = await db.query.users.findFirst({ where: eq(notifications.userId, userId) });
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
