import * as dotenv from 'dotenv';
dotenv.config();

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UrlsModule } from '../src/urls/urls.module';
import { getModelToken } from '@nestjs/sequelize';
import { Url } from '../src/urls/models/url.model';
import { origUrl, shortLink } from '../src/urls/stubs/urls.stubs';
import { CreateShortenedUrlDto } from '../src/urls/dtos/CreateShortenedUrl.dto';
import { RedisMock } from '../src/redis/mocks/redis.mock';

const mockUrlModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

jest.mock('nanoid', () => ({
  nanoid: jest.fn().mockReturnValue('abcdefghij'),
}));

const createShortenedUrlDto: CreateShortenedUrlDto = {
  url: origUrl,
};

describe('UrlController (e2e)', () => {
  let app: INestApplication;
  let redisMock: RedisMock;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UrlsModule],
    })
      .overrideProvider(getModelToken(Url))
      .useValue(mockUrlModel)
      .overrideProvider('REDIS')
      .useFactory({
        factory: () => {
          redisMock = new RedisMock({
            port: +process.env.REDIS_PORT,
            host: process.env.REDIS_HOST,
          });
          return redisMock;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/urls (POST)', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return shortLink if in redis', () => {
      return request(app.getHttpServer())
        .post('/urls')
        .send(createShortenedUrlDto)
        .expect(201)
        .expect(shortLink);
    });

    it('should create shortLink', () => {
      jest.spyOn(redisMock, 'get').mockReturnValue(null);

      return request(app.getHttpServer())
        .post('/urls')
        .send(createShortenedUrlDto)
        .expect(201)
        .expect(shortLink);
    });
  });
});
