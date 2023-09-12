import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  async setData(
    key: string,
    data: string,
    token: string = 'EX',
    seconds: number = 3600,
  ): Promise<string> {
    return await this.redis.set(key, data, token as any, seconds);
  }

  async getData(key: string): Promise<string> {
    return await this.redis.get(key);
  }
}
