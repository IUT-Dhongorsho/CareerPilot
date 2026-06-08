import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

// Mapping Postgres error codes to user-friendly messages
const DB_ERROR_MAP: Record<string, string> = {
  '23505': 'A record with this information already exists.', // Unique violation
  '23503': 'This action cannot be completed because a related record is missing.', // Foreign key violation
  '23502': 'Required information is missing.', // Not null violation
  '42P01': 'Database table configuration error.', // Undefined table
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Always log the full error on the server for debugging
  console.error('[Error Handler]:', {
    message: err.message,
    code: err.code,
    detail: err.detail,
    stack: err.stack,
  });

  let message = err.message || 'An unexpected error occurred.';
  let statusCode = err.statusCode || 500;

  // 1. Detect and Sanitize Database Errors (Postgres/Drizzle)
  if (err.code && DB_ERROR_MAP[err.code]) {
    message = DB_ERROR_MAP[err.code];
    statusCode = 400; // Database constraint errors are usually client-side data issues
  } else if (err.message?.includes('PostgresError') || err.message?.includes('DrizzleQueryError')) {
    message = 'A database error occurred. Please try again later.';
    statusCode = 500;
  }

  // 2. Determine what details to expose
  // In production, we NEVER send the stack trace or raw DB details
  const errorDetails = process.env.NODE_ENV === 'development' ? { 
    stack: err.stack,
    code: err.code,
    detail: err.detail 
  } : undefined;

  return sendError(res, errorDetails, message, statusCode);
};
