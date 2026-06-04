import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { sendError } from '../utils/apiResponse';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, null, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (!decoded || !decoded.sub) {
      return sendError(res, null, 'Invalid token', 401);
    }

    // Optional: Verify user exists in our local DB
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.sub),
    });

    if (!user) {
      return sendError(res, null, 'User not found in local records. Please sync.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, error, 'Authentication failed', 401);
  }
};
