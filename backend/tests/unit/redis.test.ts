import { redis } from '../../src/config/redis';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Redis Connection', () => {
  it('should be able to set and get a value', async () => {
    const key = 'test:ping';
    const value = 'pong';
    
    await redis.set(key, value);
    const result = await redis.get(key);
    
    expect(result).toBe(value);
    await redis.del(key);
  });

  it('should verify the connection status', async () => {
    expect(['connect', 'ready']).toContain(redis.status);
  });
});
