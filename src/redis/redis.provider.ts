import { Redis } from 'ioredis';

export const redisProvider = {
  provide: 'REDIS',
  useFactory: () => {
    return new Redis({
      port: +process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
    });
  },
};
