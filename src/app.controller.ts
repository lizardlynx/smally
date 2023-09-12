import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { UrlsService } from './urls/urls.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly urlsService: UrlsService,
  ) {}

  @Get(':hash')
  async getOriginalUrl(@Param('hash') hash: string, @Res() res) {
    const origUrl = await this.urlsService.getOriginalUrl(hash);
    res.redirect(origUrl);
  }

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
