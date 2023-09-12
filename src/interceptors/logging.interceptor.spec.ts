import * as dotenv from 'dotenv';
dotenv.config();

import { Test, TestingModule } from '@nestjs/testing';
import { LoggingInterceptor } from './logging.interceptor';
import { Logger } from '@nestjs/common';
import { of } from 'rxjs';

const loggerLogSpy = jest
  .spyOn(Logger.prototype, 'log')
  .mockImplementation(jest.fn());
const loggerDebugSpy = jest
  .spyOn(Logger.prototype, 'debug')
  .mockImplementation(jest.fn());

const requestMock = {
  get: jest.fn(() => 'Mozilla Firefox'),
  ip: 'someip',
  method: 'GET',
  url: '/someUrl',
};

const responseMock = {
  statusCode: 200,
};

const contextMock = {
  switchToHttp: jest.fn(() => {
    return {
      getRequest: jest.fn(() => requestMock),
      getResponse: jest.fn(() => responseMock),
    };
  }),
  getHandler: jest.fn(() => {
    return {
      name: 'someMethod',
    };
  }),
  getClass: jest.fn(() => {
    return {
      name: 'SomeClass',
    };
  }),
};

const nextMock = {
  handle: () => of('someRes'),
};

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
  });

  describe('intercept', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should log request data', async () => {
      interceptor.intercept(contextMock as any, nextMock as any);

      expect(loggerLogSpy).toHaveBeenCalledWith(
        `${requestMock.method} ${requestMock.url} Mozilla Firefox ${requestMock.ip}: SomeClass someMethod invoked...`,
      );
    });

    it('should log data and log debug data', async () => {
      jest.spyOn(interceptor, 'countTimeTook').mockReturnValueOnce(300);
      jest.spyOn(requestMock, 'get').mockReturnValueOnce(null);

      const data = interceptor.intercept(contextMock as any, nextMock as any);

      data.subscribe((res) => {
        expect(loggerLogSpy).toHaveBeenLastCalledWith(
          `${requestMock.method} ${requestMock.url} ${200} ${''} ${
            requestMock.ip
          } 300ms`,
        );
        expect(loggerDebugSpy).toHaveBeenCalledWith(res);
        expect(res).toEqual('someRes');
      });
    });

    it('should log debug redirect', async () => {
      jest.spyOn(interceptor, 'countTimeTook').mockReturnValueOnce(300);
      jest.spyOn(contextMock, 'getHandler').mockReturnValueOnce({
        name: 'getOriginalUrl',
      });

      const data = interceptor.intercept(contextMock as any, nextMock as any);

      data.subscribe((res) => {
        expect(loggerLogSpy).toHaveBeenLastCalledWith(
          `${requestMock.method} ${
            requestMock.url
          } ${200} ${'Mozilla Firefox'} ${requestMock.ip} 300ms`,
        );
        expect(loggerDebugSpy).toHaveBeenCalledWith('redirected');
        expect(res).toEqual('someRes');
      });
    });
  });

  describe('countTimeTook', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return correct time', () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000);
      const res = interceptor.countTimeTook(1487076702000);
      expect(res).toEqual(6000);
    });
  });
});
