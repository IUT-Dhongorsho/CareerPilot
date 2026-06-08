import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { sendError } from '../utils/apiResponse.js';
import { supabase } from '../utils/supabase-client.js';

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

    // Verify token using Supabase Auth
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      return sendError(res, null, 'Invalid token', 401);
    }

    // Verify user exists in our local shadow DB
    const user = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });

    if (!user) {
      return sendError(res, null, 'User not found in local records. Please sync.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return sendError(res, error, 'Authentication failed', 401);
  }
};
