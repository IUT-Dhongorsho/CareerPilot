import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorDetails = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  return sendError(res, errorDetails, message, statusCode);
};
