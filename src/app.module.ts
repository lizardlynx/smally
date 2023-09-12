import { Module, Scope } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlsModule } from './urls/urls.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Url } from './urls/models/url.model';
import { UrlsService } from './urls/urls.service';
import { RedisService } from './redis/redis.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { MainExceptionFilter } from './filters/mainException.filter';
import { redisProvider } from './redis/redis.provider';

@Module({
  imports: [
    UrlsModule,
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.MYSQL_HOST,
      port: +process.env.MYSQL_PORT,
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      models: [Url],
      logging: false,
      autoLoadModels: true,
    }),
    SequelizeModule.forFeature([Url]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UrlsService,
    RedisService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
      scope: Scope.REQUEST,
    },
    {
      provide: APP_FILTER,
      useClass: MainExceptionFilter,
    },
    redisProvider,
  ],
})
export class AppModule {}
