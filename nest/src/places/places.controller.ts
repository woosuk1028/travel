import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlacesService } from './places.service';

type AuthRequest = { user: { id: number } };

@UseGuards(JwtAuthGuard)
@Controller('trips/:tripId/places')
export class PlacesController {
  constructor(private readonly places: PlacesService) {}

  @Get()
  list(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
  ) {
    return this.places.list(req.user.id, tripId);
  }

  @Get(':id')
  findOne(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.places.findOne(req.user.id, tripId, id);
  }

  @Post()
  create(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Body() dto: CreatePlaceDto,
  ) {
    return this.places.create(req.user.id, tripId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlaceDto,
  ) {
    return this.places.update(req.user.id, tripId, id, dto);
  }

  @Delete(':id')
  remove(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.places.remove(req.user.id, tripId, id);
  }
}
