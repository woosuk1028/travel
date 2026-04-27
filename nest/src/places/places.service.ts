import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripsService } from '../trips/trips.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Place } from './place.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place) private readonly places: Repository<Place>,
    private readonly tripsService: TripsService,
  ) {}

  async list(userId: number, tripId: number) {
    await this.tripsService.findOneByUser(userId, tripId);
    return this.places.find({
      where: { tripId },
      order: { visitAt: 'ASC', dayOrder: 'ASC', id: 'ASC' },
    });
  }

  async findOne(userId: number, tripId: number, id: number) {
    await this.tripsService.findOneByUser(userId, tripId);
    const place = await this.places.findOne({ where: { id, tripId } });
    if (!place) throw new NotFoundException('Place not found');
    return place;
  }

  async create(userId: number, tripId: number, dto: CreatePlaceDto) {
    await this.tripsService.findOneByUser(userId, tripId);
    const place = this.places.create({ ...dto, tripId });
    return this.places.save(place);
  }

  async update(
    userId: number,
    tripId: number,
    id: number,
    dto: UpdatePlaceDto,
  ) {
    const place = await this.findOne(userId, tripId, id);
    Object.assign(place, dto);
    await this.places.save(place);
    return this.findOne(userId, tripId, id);
  }

  async remove(userId: number, tripId: number, id: number) {
    const place = await this.findOne(userId, tripId, id);
    await this.places.remove(place);
    return { id };
  }

  async assertBelongsToTrip(tripId: number, placeId: number) {
    const exists = await this.places.exist({ where: { id: placeId, tripId } });
    if (!exists) throw new NotFoundException('Place not found in this trip');
  }
}
