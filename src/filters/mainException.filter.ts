import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';

@Catch()
export class MainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MainExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  isHttpException(exception: any): boolean {
    return exception instanceof HttpException;
  }

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const httpStatus = this.isHttpException(exception)
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const body = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      url: request.url,
    };

    this.logger.error(body);
    httpAdapter.reply(response, body, httpStatus);
  }
}
