import { IsObject, IsOptional, IsString, IsUrl } from 'class-validator';

export class SubscribeDto {
  @IsUrl({ require_tld: false })
  endpoint!: string;

  @IsObject()
  keys!: { p256dh: string; auth: string };

  @IsOptional()
  @IsString()
  userAgent?: string;
}
