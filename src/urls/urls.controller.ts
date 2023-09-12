import { Body, Controller, Post } from '@nestjs/common';
import { CreateShortenedUrlDto } from './dtos/CreateShortenedUrl.dto';
import { ValidationPipe } from '@nestjs/common';
import { UrlsService } from './urls.service';

@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post()
  async createShortenedUrl(
    @Body(
      new ValidationPipe({
        whitelist: true,
      }),
    )
    createShortenedUrlDto: CreateShortenedUrlDto,
  ): Promise<string> {
    return await this.urlsService.createShortenedUrl(createShortenedUrlDto);
  }
}
