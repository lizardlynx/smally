import * as dotenv from 'dotenv';
dotenv.config();

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { RedisService } from '../redis/redis.service';
import { UrlsService } from './urls.service';
import { CreateShortenedUrlDto } from './dtos/CreateShortenedUrl.dto';
import { Url } from './models/url.model';
import { NotFoundException } from '@nestjs/common';
import { origUrl, alias, shortLink } from './stubs/urls.stubs';

const createShortenedUrlDto: CreateShortenedUrlDto = {
  url: origUrl,
};
const urlStub = {
  id: 1,
  origUrl,
  shortUrl: alias,
  clicks: 0,
  increment: jest.fn(),
};

jest.mock('../redis/redis.service.ts');
jest.mock('nanoid', () => ({
  nanoid: jest.fn().mockReturnValue('abcdefghij'),
}));

const mockUrlModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

describe('UrlsService', () => {
  let service: UrlsService;
  let redisService: RedisService;
  let urlModelMock: typeof Url;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        RedisService,
        { provide: getModelToken(Url), useValue: mockUrlModel },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    redisService = module.get<RedisService>(RedisService);
    urlModelMock = module.get<typeof Url>(getModelToken(Url));
  });

  describe('createShortenedUrl', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return link if origUrl exists in redis', async () => {
      jest.spyOn(redisService, 'getData').mockResolvedValueOnce(alias);

      const res = await service.createShortenedUrl(createShortenedUrlDto);

      expect(redisService.getData).toHaveBeenCalledWith(
        createShortenedUrlDto.url,
      );
      expect(res).toEqual(shortLink);
    });

    it('should return link if origUrl exists in db', async () => {
      const dbParams = {
        attributes: ['shortUrl'],
        where: { origUrl },
      };
      const dbRes = { shortUrl: alias };

      jest.spyOn(urlModelMock, 'findOne').mockResolvedValueOnce(dbRes as any);

      const res = await service.createShortenedUrl(createShortenedUrlDto);

      expect(urlModelMock.findOne).toHaveBeenCalledWith(dbParams);
      expect(res).toEqual(shortLink);
    });

    it('should create record in db and in redis', async () => {
      const dbParams = { origUrl, shortUrl: alias };

      const res = await service.createShortenedUrl(createShortenedUrlDto);

      expect(urlModelMock.create).toHaveBeenCalledWith(dbParams);
      expect(redisService.setData).toHaveBeenCalledWith(origUrl, alias);
      expect(redisService.setData).toHaveBeenCalledWith(alias, origUrl);
      expect(res).toEqual(shortLink);
    });
  });

  describe('getOriginalUrl', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return origLink if it exists in redis', async () => {
      jest.spyOn(redisService, 'getData').mockResolvedValueOnce(origUrl);

      const res = await service.getOriginalUrl(alias);

      expect(redisService.getData).toHaveBeenCalledWith(alias);
      expect(res).toEqual(origUrl);
    });

    it('should throw an error if origUrl is not in db', async () => {
      await expect(service.getOriginalUrl(alias)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should search db, increment clicks and return origUrl', async () => {
      const dbParams = { where: { shortUrl: alias } };
      const incDbParams = { by: 1 };
      jest.spyOn(urlModelMock, 'findOne').mockResolvedValueOnce(urlStub as any);

      const res = await service.getOriginalUrl(alias);

      expect(urlModelMock.findOne).toHaveBeenCalledWith(dbParams);
      expect(urlStub.increment).toHaveBeenCalledWith('clicks', incDbParams);
      expect(res).toEqual(origUrl);
    });
  });
});
