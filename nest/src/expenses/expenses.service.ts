import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlacesService } from '../places/places.service';
import { TripsService } from '../trips/trips.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense) private readonly expenses: Repository<Expense>,
    private readonly tripsService: TripsService,
    private readonly placesService: PlacesService,
  ) {}

  async list(userId: number, tripId: number) {
    await this.tripsService.assertAccessible(userId, tripId);
    return this.expenses.find({
      where: { tripId },
      order: { paidAt: 'DESC', id: 'DESC' },
    });
  }

  async findOne(userId: number, tripId: number, id: number) {
    await this.tripsService.assertAccessible(userId, tripId);
    const expense = await this.expenses.findOne({ where: { id, tripId } });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async create(userId: number, tripId: number, dto: CreateExpenseDto) {
    await this.tripsService.assertAccessible(userId, tripId);
    if (dto.placeId) {
      await this.placesService.assertBelongsToTrip(tripId, dto.placeId);
    }
    const expense = this.expenses.create({
      tripId,
      placeId: dto.placeId ?? null,
      amount: dto.amount,
      currency: dto.currency ?? 'KRW',
      category: dto.category ?? 'other',
      description: dto.description,
      paidAt: new Date(dto.paidAt),
    });
    return this.expenses.save(expense);
  }

  async update(
    userId: number,
    tripId: number,
    id: number,
    dto: UpdateExpenseDto,
  ) {
    await this.tripsService.assertAccessible(userId, tripId);
    const expense = await this.expenses.findOne({ where: { id, tripId } });
    if (!expense) throw new NotFoundException('Expense not found');
    if (dto.placeId !== undefined && dto.placeId !== null) {
      await this.placesService.assertBelongsToTrip(tripId, dto.placeId);
    }
    if (dto.amount !== undefined) expense.amount = dto.amount;
    if (dto.currency !== undefined) expense.currency = dto.currency;
    if (dto.category !== undefined) expense.category = dto.category;
    if (dto.description !== undefined) expense.description = dto.description;
    if (dto.paidAt !== undefined) expense.paidAt = new Date(dto.paidAt);
    if (dto.placeId !== undefined) expense.placeId = dto.placeId;
    await this.expenses.save(expense);
    return this.findOne(userId, tripId, id);
  }

  async remove(userId: number, tripId: number, id: number) {
    await this.tripsService.assertAccessible(userId, tripId);
    const expense = await this.expenses.findOne({ where: { id, tripId } });
    if (!expense) throw new NotFoundException('Expense not found');
    await this.expenses.remove(expense);
    return { id };
  }
}
