import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './trip.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip) private readonly trips: Repository<Trip>,
  ) {}

  findAllByUser(userId: number) {
    return this.trips.find({
      where: { userId },
      order: { startDate: 'DESC', id: 'DESC' },
    });
  }

  async findOneByUser(userId: number, id: number) {
    const trip = await this.trips.findOne({ where: { id, userId } });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  create(userId: number, dto: CreateTripDto) {
    this.assertDateRange(dto.startDate, dto.endDate);
    const trip = this.trips.create({ ...dto, userId });
    return this.trips.save(trip);
  }

  async update(userId: number, id: number, dto: UpdateTripDto) {
    const trip = await this.findOneByUser(userId, id);
    const startDate = dto.startDate ?? trip.startDate;
    const endDate = dto.endDate ?? trip.endDate;
    this.assertDateRange(startDate, endDate);
    Object.assign(trip, dto);
    await this.trips.save(trip);
    return this.findOneByUser(userId, id);
  }

  async remove(userId: number, id: number) {
    const trip = await this.findOneByUser(userId, id);
    await this.trips.remove(trip);
    return { id };
  }

  private assertDateRange(start: string, end: string) {
    if (new Date(start) > new Date(end)) {
      throw new BadRequestException('startDate must be before or equal to endDate');
    }
  }
}
