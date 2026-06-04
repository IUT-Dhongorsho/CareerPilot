import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

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
    next(new Error('Authentication error'));
  }
};
