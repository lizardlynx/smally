import { urlsRedisStub } from '../../urls/stubs/urls.stubs';

export class RedisMock {
  constructor(opts) {}
  set = jest.fn();
  param = 'this is mock';
  get = jest.fn((el) => urlsRedisStub[el]);
}
