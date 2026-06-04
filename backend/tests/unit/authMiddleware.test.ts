import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware } from '../../src/middleware/auth.middleware';
import { db } from '../../src/db';
import jwt from 'jsonwebtoken';

vi.mock('../../src/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('should call next if token is valid and user exists', async () => {
    req.headers.authorization = 'Bearer valid-token';
    (jwt.verify as any).mockReturnValue({ sub: 'user123' });
    (db.query.users.findFirst as any).mockResolvedValue({ id: 'user123' });

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 'user123' });
  });

  it('should return 401 if no token is provided', async () => {
    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'No token provided' }));
  });

  it('should return 401 if token is invalid', async () => {
    req.headers.authorization = 'Bearer invalid-token';
    (jwt.verify as any).mockImplementation(() => { throw new Error('Invalid token'); });

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
