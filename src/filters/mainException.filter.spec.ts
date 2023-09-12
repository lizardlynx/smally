import * as dotenv from 'dotenv';
dotenv.config();

import { Test, TestingModule } from '@nestjs/testing';
import { MainExceptionFilter } from './mainException.filter';
import { HttpException, Logger, NotFoundException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

const loggerErrorSpy = jest
  .spyOn(Logger.prototype, 'error')
  .mockImplementation(jest.fn());

const exceptionMock = {
  getStatus: jest.fn().mockReturnValue(401),
};

const responseMock = () => 'someResponse';

const hostMock = {
  switchToHttp: jest.fn(() => {
    return {
      getResponse: jest.fn(() => responseMock),
      getRequest: jest.fn(() => {
        return { url: '/somePath' };
      }),
    };
  }),
};

const httpAdapterHostMock = {
  httpAdapter: {
    reply: jest.fn(),
  },
};

describe('MainExceptionFilter', () => {
  let filter: MainExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MainExceptionFilter],
    })
      .overrideProvider(HttpAdapterHost)
      .useValue(httpAdapterHostMock)
      .compile();

    filter = module.get<MainExceptionFilter>(MainExceptionFilter);
  });

  describe('catch', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should log http error', () => {
      const loggerParams = {
        statusCode: 401,
        timestamp: expect.any(String),
        url: '/somePath',
      };
      jest.spyOn(filter, 'isHttpException').mockReturnValue(true);
      filter.catch(exceptionMock, hostMock as any);
      expect(loggerErrorSpy).toHaveBeenCalledWith(loggerParams);
      expect(httpAdapterHostMock.httpAdapter.reply).toHaveBeenCalledWith(
        responseMock,
        loggerParams,
        401,
      );
    });

    it('should log server error as 500', () => {
      exceptionMock.getStatus.mockReturnValueOnce(418);
      const loggerParams = {
        statusCode: 500,
        timestamp: expect.any(String),
        url: '/somePath',
      };

      jest.spyOn(filter, 'isHttpException').mockReturnValue(false);
      filter.catch(exceptionMock, hostMock as any);
      expect(loggerErrorSpy).toHaveBeenCalledWith(loggerParams);
      expect(httpAdapterHostMock.httpAdapter.reply).toHaveBeenCalledWith(
        responseMock,
        loggerParams,
        500,
      );
    });
  });

  describe('isHttpException', () => {
    it('should return true if exception is http', () => {
      const res = filter.isHttpException(new HttpException('exception', 400));
      expect(res).toBeTruthy();
    });

    it('should return false if exception is not http', () => {
      const res = filter.isHttpException(new NotFoundException('exception'));
      expect(res).toBeTruthy();
    });
  });
});
