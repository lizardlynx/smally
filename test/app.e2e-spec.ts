import * as dotenv from 'dotenv';
dotenv.config();

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { alias } from '../src/urls/stubs/urls.stubs';
import { RedisMock } from '../src/redis/mocks/redis.mock';
import { Url } from '../src/urls/models/url.model';
import { getModelToken } from '@nestjs/sequelize';
import { AppController } from '../src/app.controller';
import { UrlsService } from '../src/urls/urls.service';
import { AppService } from '../src/app.service';
import { RedisService } from '../src/redis/redis.service';

const mockUrlModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let redisMock: RedisMock;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [AppController],
      providers: [
        RedisService,
        UrlsService,
        AppService,
        { provide: getModelToken(Url), useValue: mockUrlModel },
        {
          provide: 'REDIS',
          useFactory: () => {
            redisMock = new RedisMock({
              port: +process.env.REDIS_PORT,
              host: process.env.REDIS_HOST,
            });
            return redisMock;
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/:hash (GET)', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should redirect if origUrl found', () => {
      return request(app.getHttpServer()).get(`/${alias}`).expect(302);
    });

    it('should throw 404 error if origUrl not found', () => {
      jest.spyOn(redisMock, 'get').mockReturnValue(null);
      return request(app.getHttpServer()).get(`/${alias}`).expect(404);
    });
  });
});
