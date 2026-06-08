import { Socket } from 'socket.io';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../utils/jwt.js';

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded: any = await verifyToken(token);

    if (!decoded || !decoded.sub) {
      return next(new Error('Authentication error: Invalid token'));
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.sub),
    });

    if (!user) {
      return next(new Error('Authentication error: User not synced'));
    }

    (socket as any).user = user;
    next();
  } catch (error) {
    console.error('[SocketAuth] error:', error);
    next(new Error('Authentication error'));
  }
};
