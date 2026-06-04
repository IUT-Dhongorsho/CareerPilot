import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { AuthService } from '../../src/services/auth.service';

vi.mock('../../src/services/auth.service');

describe('AuthController Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sync user and return success response', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    (AuthService.syncUser as any).mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/api/auth/sync')
      .send(mockUser);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      payload: mockUser,
      message: 'User synced successfully',
    });
  });

  it('should return error response for invalid data (Zod validation)', async () => {
    const response = await request(app)
      .post('/api/auth/sync')
      .send({ id: '', email: 'invalid-email' });

    expect(response.status).toBe(500); // errorHandler maps it to 500 currently
    expect(response.body.success).toBe(false);
  });
});
