import * as dotenv from 'dotenv';
dotenv.config();

import { Test, TestingModule } from '@nestjs/testing';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';
import { CreateShortenedUrlDto } from './dtos/CreateShortenedUrl.dto';
import { origUrl, shortLink } from './stubs/urls.stubs';

const createShortenedUrlDto: CreateShortenedUrlDto = {
  url: origUrl,
};

jest.mock('./urls.service');

describe('UrlsController', () => {
  let controller: UrlsController;
  let service: UrlsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [UrlsService],
    }).compile();

    controller = module.get<UrlsController>(UrlsController);
    service = module.get<UrlsService>(UrlsService);
  });

  describe('createShortenedUrl', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call urlsService', async () => {
      jest.spyOn(service, 'createShortenedUrl').mockResolvedValue(shortLink);

      const res = await controller.createShortenedUrl(createShortenedUrlDto);
      expect(service.createShortenedUrl).toBeCalledWith(createShortenedUrlDto);
      expect(res).toEqual(shortLink);
    });
  });
});
