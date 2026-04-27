import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscribeDto } from './dto/subscribe.dto';
import { PushService } from './push.service';

type AuthRequest = { user: { id: number } };

@Controller('push')
export class PushController {
  constructor(private readonly push: PushService) {}

  @Get('vapid-public-key')
  publicKey() {
    return { publicKey: this.push.getPublicKey() };
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  subscribe(@Req() req: AuthRequest, @Body() dto: SubscribeDto) {
    return this.push.subscribe(req.user.id, {
      endpoint: dto.endpoint,
      keys: dto.keys,
      userAgent: dto.userAgent,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('unsubscribe')
  unsubscribe(@Req() req: AuthRequest, @Query('endpoint') endpoint: string) {
    return this.push.unsubscribe(req.user.id, endpoint);
  }
}
