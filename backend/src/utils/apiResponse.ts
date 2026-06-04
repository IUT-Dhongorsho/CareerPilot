import { Response } from 'express';

export const sendSuccess = (res: Response, payload: any, message: string = 'Success', statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    payload,
    message,
  });
};

export const sendError = (res: Response, error: any, message: string = 'Error', statusCode: number = 500) => {
  return res.status(statusCode).json({
    success: false,
    error,
    message,
  });
};
