import { describe, it, expect, vi, beforeEach } from 'vitest';
import { socketAuthMiddleware } from '../../src/ws/socket.middleware';
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

describe('SocketAuthMiddleware', () => {
  let socket: any;
  let next: any;

  beforeEach(() => {
    socket = {
      handshake: {
        auth: {},
        headers: {},
      },
    };
    next = vi.fn();
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('should call next if token is valid and user exists', async () => {
    socket.handshake.auth.token = 'valid-token';
    (jwt.verify as any).mockReturnValue({ sub: 'user123' });
    (db.query.users.findFirst as any).mockResolvedValue({ id: 'user123' });

    await socketAuthMiddleware(socket, next);

    expect(next).toHaveBeenCalledWith();
    expect(socket.user).toEqual({ id: 'user123' });
  });

  it('should call next with error if no token is provided', async () => {
    await socketAuthMiddleware(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Authentication error: No token provided');
  });
});
