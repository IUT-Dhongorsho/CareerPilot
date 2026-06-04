import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { db } from '../../src/db';
import jwt from 'jsonwebtoken';

vi.mock('../../src/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
      notifications: {
        findMany: vi.fn(),
      },
    },
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  },
}));

vi.mock('jsonwebtoken');

describe('NotificationController Integration', () => {
  const mockToken = 'Bearer valid-token';
  const mockUser = { id: 'user123' };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    (jwt.verify as any).mockReturnValue({ sub: 'user123' });
    (db.query.users.findFirst as any).mockResolvedValue(mockUser);
  });

  it('should get notifications for authenticated user', async () => {
    const mockNotifications = [{ id: '1', message: 'test' }];
    (db.query.notifications.findMany as any).mockResolvedValue(mockNotifications);

    const response = await request(app)
      .get('/api/notifications')
      .set('Authorization', mockToken);

    expect(response.status).toBe(200);
    expect(response.body.payload).toEqual(mockNotifications);
  });

  it('should mark a notification as read', async () => {
    const mockNotification = { id: '1', isRead: true };
    (db.update as any).mockReturnThis();
    (db.returning as any).mockResolvedValue([mockNotification]);

    const response = await request(app)
      .patch('/api/notifications/1/read')
      .set('Authorization', mockToken);

    expect(response.status).toBe(200);
    expect(response.body.payload.isRead).toBe(true);
  });
});
