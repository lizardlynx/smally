import { Injectable, NotFoundException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { CreateShortenedUrlDto } from './dtos/CreateShortenedUrl.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Url } from './models/url.model';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UrlsService {
  constructor(
    @InjectModel(Url) private readonly urlModel: typeof Url,
    private readonly redisService: RedisService,
  ) {}

  async createShortenedUrl(
    createShortenedUrlDto: CreateShortenedUrlDto,
  ): Promise<string> {
    const origUrl = createShortenedUrlDto.url;

    const redisValue = await this.redisService.getData(origUrl);
    if (redisValue) return `${process.env.APP_URL}/${redisValue}`;

    const res = await this.urlModel.findOne({
      attributes: ['shortUrl'],
      where: { origUrl },
    });
    if (res) return `${process.env.APP_URL}/${res.shortUrl}`;

    const alias = nanoid(10);
    const shortUrl = `${process.env.APP_URL}/${alias}`;
    await this.urlModel.create({ origUrl, shortUrl: alias });

    await this.redisService.setData(origUrl, alias);
    await this.redisService.setData(alias, origUrl);

    return shortUrl;
  }

  async getOriginalUrl(hash: string): Promise<string> {
    const redisValue = await this.redisService.getData(hash);
    if (redisValue) return redisValue;

    const opts = { where: { shortUrl: hash } };
    const res = await this.urlModel.findOne(opts);
    if (!res) throw new NotFoundException();

    await res.increment('clicks', { by: 1 });
    return res.origUrl;
  }
}
