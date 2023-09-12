import { IsString, IsUrl } from 'class-validator';

export class CreateShortenedUrlDto {
  @IsString()
  @IsUrl()
  url: string;
}
