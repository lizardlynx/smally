import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlsService } from './urls/urls.service';
import { alias, origUrl } from './urls/stubs/urls.stubs';

jest.mock('./urls/urls.service');

const resMock = {
  redirect: jest.fn(),
};

describe('AppController', () => {
  let appController: AppController;
  let urlsService: UrlsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, UrlsService],
    }).compile();

    appController = app.get<AppController>(AppController);
    urlsService = app.get<UrlsService>(UrlsService);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('getOriginalUrl', () => {
    it('should call urlsService and redirect to origUrl', async () => {
      jest.spyOn(urlsService, 'getOriginalUrl').mockResolvedValue(origUrl);

      await appController.getOriginalUrl(alias, resMock);
      expect(urlsService.getOriginalUrl).toHaveBeenCalledWith(alias);
      expect(resMock.redirect).toHaveBeenCalledWith(origUrl);
    });
  });
});
