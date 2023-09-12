import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Url } from './models/url.model';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';
import { RedisService } from '../redis/redis.service';
import { redisProvider } from '../redis/redis.provider';

@Module({
  imports: [SequelizeModule.forFeature([Url])],
  controllers: [UrlsController],
  providers: [UrlsService, RedisService, redisProvider],
})
export class UrlsModule {}
