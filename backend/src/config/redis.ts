import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('[Redis] Connection Error:', err.message);
});

redis.on('connect', () => {
  console.log('[Redis] Connected successfully');
});
