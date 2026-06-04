import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '../../src/services/notification.service';
import { db } from '../../src/db';
import { getIO } from '../../src/ws';
import webpush from 'web-push';

vi.mock('../../src/db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    query: {
      users: { findFirst: vi.fn() },
      pushSubscriptions: { findMany: vi.fn() }
    },
    delete: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  },
}));

vi.mock('../../src/ws', () => ({
  getIO: vi.fn(),
}));

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue({}),
  }
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: '123' }),
    }),
  },
}));

describe('NotificationService (Enhanced)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VAPID_PUBLIC_KEY = 'test-pub';
    process.env.VAPID_PRIVATE_KEY = 'test-priv';
  });

  it('should trigger the full notification flow', async () => {
    const mockNotification = { id: '1', userId: 'user1', type: 'job_found', message: 'test' };
    (db.insert as any).mockReturnThis();
    (db.returning as any).mockResolvedValue([mockNotification]);
    
    const mockEmit = vi.fn();
    (getIO as any).mockReturnValue({ to: vi.fn().mockReturnValue({ emit: mockEmit }) });
    (db.query.pushSubscriptions.findMany as any).mockResolvedValue([{ id: 'sub1', subscription: {} }]);

    const result = await NotificationService.sendNotification('user1', 'job_found', 'test');

    expect(db.insert).toHaveBeenCalled();
    expect(mockEmit).toHaveBeenCalledWith('notification:new', mockNotification);
    expect(webpush.sendNotification).toHaveBeenCalled();
    expect(result).toEqual(mockNotification);
  });
});
