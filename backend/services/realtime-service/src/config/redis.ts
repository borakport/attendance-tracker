import { createClient } from 'redis';

export const pubClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

export const subClient = pubClient.duplicate();

export const connectRedis = async (): Promise<void> => {
  await pubClient.connect();
  await subClient.connect();
  console.log('Redis Pub/Sub connected');
};
