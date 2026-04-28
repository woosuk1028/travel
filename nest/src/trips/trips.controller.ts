import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTripDto } from './dto/create-trip.dto';
import { JoinTripDto } from './dto/join-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripsService } from './trips.service';

type AuthRequest = { user: { id: number; email: string; name: string } };

@UseGuards(JwtAuthGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly trips: TripsService) {}

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.trips.listForUser(req.user.id);
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  join(@Req() req: AuthRequest, @Body() dto: JoinTripDto) {
    return this.trips.joinByCode(req.user.id, dto.code);
  }

  @Get(':id')
  findOne(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.trips.findOneAccessible(req.user.id, id);
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateTripDto) {
    return this.trips.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTripDto,
  ) {
    return this.trips.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.trips.remove(req.user.id, id);
  }

  @Post(':id/share-code')
  @HttpCode(HttpStatus.OK)
  regenerateShareCode(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.trips.regenerateShareCode(req.user.id, id);
  }

  @Get(':id/members')
  listMembers(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.trips.listMembers(req.user.id, id);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) memberUserId: number,
  ) {
    return this.trips.removeMember(req.user.id, id, memberUserId);
  }

  @Delete(':id/leave')
  leave(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.trips.leave(req.user.id, id);
  }
}
