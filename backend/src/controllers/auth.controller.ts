import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';
import { syncUserSchema } from '../validators/auth.validator';

export class AuthController {
  static syncUser = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = syncUserSchema.parse(req.body);

    const user = await AuthService.syncUser(validatedData);

    sendSuccess(res, user, 'User synced successfully');
  });
}
