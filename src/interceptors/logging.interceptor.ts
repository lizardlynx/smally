import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent') || '';

    const { ip, method, url } = request;
    const handlerName = context.getHandler().name;

    this.logger.log(
      `${method} ${url} ${userAgent} ${ip}: ${
        context.getClass().name
      } ${handlerName} invoked...`,
    );

    const startDate = Date.now();

    return next.handle().pipe(
      tap((res) => {
        const response = context.switchToHttp().getResponse();

        const { statusCode } = response;
        const timeTook = this.countTimeTook(startDate);

        this.logger.log(
          `${method} ${url} ${statusCode} ${userAgent} ${ip} ${timeTook}ms`,
        );
        if (handlerName == 'getOriginalUrl') this.logger.debug(`redirected`);
        else this.logger.debug(res);
      }),
    );
  }

  countTimeTook(startDate) {
    return Date.now() - startDate;
  }
}
