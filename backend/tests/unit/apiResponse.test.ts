import { describe, it, expect, vi } from 'vitest';
import { sendSuccess, sendError } from '../../src/utils/apiResponse';

describe('apiResponse Utility', () => {
  it('should send a success response with correct structure', () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    const payload = { id: 1 };
    const message = 'Test Success';
    
    sendSuccess(res, payload, message, 201);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      payload,
      message,
    });
  });

  it('should send an error response with correct structure', () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    const error = { code: 'ERR' };
    const message = 'Test Error';
    
    sendError(res, error, message, 400);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error,
      message,
    });
  });
});
