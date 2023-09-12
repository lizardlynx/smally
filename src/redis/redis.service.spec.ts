import * as dotenv from 'dotenv';
dotenv.config();

import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { Redis } from 'ioredis';
import { origUrl, alias } from '../urls/stubs/urls.stubs';
import { RedisMock } from './mocks/redis.mock';

const getDataParams = [
  [origUrl, alias],
  [alias, origUrl],
];

describe('RedisService', () => {
  let service: RedisService;
  let redis: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'REDIS',
          useFactory: () => {
            return new RedisMock({
              port: +process.env.REDIS_PORT,
              host: process.env.REDIS_HOST,
            });
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    redis = module.get<Redis>('REDIS');
  });

  describe('setData', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call redis set', async () => {
      await service.setData(origUrl, alias);
      expect(redis.set).toHaveBeenCalledWith(origUrl, alias, 'EX', 3600);
    });
  });

  describe('getData', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test.each(getDataParams)('should call redis get', async (el1, el2) => {
      const res = await service.getData(el1);
      expect(redis.get).toHaveBeenCalledWith(el1);
      expect(res).toEqual(el2);
    });
  });
});
