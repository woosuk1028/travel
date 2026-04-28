import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Brackets, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripMember } from './trip-member.entity';
import { Trip } from './trip.entity';

const SHARE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SHARE_CODE_LEN = 8;

export type TripRole = 'owner' | 'member';

export interface TripWithRole extends Trip {
  role: TripRole;
}

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip) private readonly trips: Repository<Trip>,
    @InjectRepository(TripMember)
    private readonly members: Repository<TripMember>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async listForUser(userId: number): Promise<TripWithRole[]> {
    const rows = await this.trips
      .createQueryBuilder('t')
      .leftJoin(
        'trip_members',
        'm',
        'm.trip_id = t.id AND m.user_id = :userId',
        { userId },
      )
      .where(
        new Brackets((qb) => {
          qb.where('t.user_id = :userId', { userId }).orWhere(
            'm.user_id = :userId',
            { userId },
          );
        }),
      )
      .orderBy('t.start_date', 'DESC')
      .addOrderBy('t.id', 'DESC')
      .getMany();

    return rows.map((t) => ({
      ...t,
      role: (t.userId === userId ? 'owner' : 'member') as TripRole,
      shareCode: t.userId === userId ? t.shareCode : null,
    }));
  }

  /** Returns trip if user is owner or member; throws otherwise. */
  async findOneAccessible(
    userId: number,
    id: number,
  ): Promise<TripWithRole> {
    const trip = await this.trips.findOne({ where: { id } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId === userId) {
      return { ...trip, role: 'owner' };
    }
    const member = await this.members.findOne({
      where: { tripId: id, userId },
    });
    if (!member) throw new NotFoundException('Trip not found');
    return { ...trip, role: 'member', shareCode: null };
  }

  /** Returns trip if user is the owner; throws otherwise. */
  async findOneOwned(userId: number, id: number): Promise<Trip> {
    const trip = await this.trips.findOne({ where: { id, userId } });
    if (!trip) {
      const exists = await this.trips.exist({ where: { id } });
      if (exists) {
        throw new ForbiddenException('Only the trip owner can do this');
      }
      throw new NotFoundException('Trip not found');
    }
    return trip;
  }

  async create(userId: number, dto: CreateTripDto) {
    this.assertDateRange(dto.startDate, dto.endDate);
    const trip = this.trips.create({
      ...dto,
      userId,
      shareCode: await this.generateUniqueShareCode(),
    });
    return this.trips.save(trip);
  }

  async update(userId: number, id: number, dto: UpdateTripDto) {
    const trip = await this.findOneOwned(userId, id);
    const startDate = dto.startDate ?? trip.startDate;
    const endDate = dto.endDate ?? trip.endDate;
    this.assertDateRange(startDate, endDate);
    Object.assign(trip, dto);
    await this.trips.save(trip);
    return this.trips.findOne({ where: { id } });
  }

  async remove(userId: number, id: number) {
    const trip = await this.findOneOwned(userId, id);
    await this.trips.remove(trip);
    return { id };
  }

  async regenerateShareCode(userId: number, id: number) {
    const trip = await this.findOneOwned(userId, id);
    trip.shareCode = await this.generateUniqueShareCode();
    await this.trips.save(trip);
    return { shareCode: trip.shareCode };
  }

  async joinByCode(userId: number, rawCode: string) {
    const code = rawCode.trim().toUpperCase();
    if (!code) throw new BadRequestException('Code is required');
    const trip = await this.trips.findOne({ where: { shareCode: code } });
    if (!trip) throw new NotFoundException('해당 코드의 여행을 찾을 수 없습니다');
    if (trip.userId === userId) {
      throw new BadRequestException('본인이 만든 여행입니다');
    }
    const existing = await this.members.findOne({
      where: { tripId: trip.id, userId },
    });
    if (!existing) {
      await this.members.save(
        this.members.create({ tripId: trip.id, userId }),
      );
    }
    return { tripId: trip.id, title: trip.title };
  }

  async leave(userId: number, id: number) {
    const trip = await this.trips.findOne({ where: { id } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId === userId) {
      throw new BadRequestException('소유자는 나갈 수 없습니다. 여행을 삭제하세요.');
    }
    await this.members.delete({ tripId: id, userId });
    return { ok: true };
  }

  async listMembers(userId: number, id: number) {
    await this.findOneOwned(userId, id);
    const rows = await this.members.find({
      where: { tripId: id },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });
    return rows.map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.user?.email,
      name: m.user?.name,
      joinedAt: m.createdAt,
    }));
  }

  async removeMember(ownerId: number, tripId: number, memberUserId: number) {
    await this.findOneOwned(ownerId, tripId);
    await this.members.delete({ tripId, userId: memberUserId });
    return { ok: true };
  }

  // --- helpers ---

  /** Throws ForbiddenException if user is not the owner. Used by other modules. */
  async assertOwner(userId: number, tripId: number): Promise<Trip> {
    return this.findOneOwned(userId, tripId);
  }

  /** Throws if user has no access. Used by other modules to gate reads. */
  async assertAccessible(userId: number, tripId: number) {
    return this.findOneAccessible(userId, tripId);
  }

  private assertDateRange(start: string, end: string) {
    if (new Date(start) > new Date(end)) {
      throw new BadRequestException(
        'startDate must be before or equal to endDate',
      );
    }
  }

  private async generateUniqueShareCode(): Promise<string> {
    for (let attempt = 0; attempt < 8; attempt++) {
      const code = this.randomCode();
      const exists = await this.trips.exist({ where: { shareCode: code } });
      if (!exists) return code;
    }
    throw new Error('Failed to generate a unique share code');
  }

  private randomCode(): string {
    const bytes = randomBytes(SHARE_CODE_LEN);
    let result = '';
    for (let i = 0; i < SHARE_CODE_LEN; i++) {
      result += SHARE_CODE_CHARS[bytes[i] % SHARE_CODE_CHARS.length];
    }
    return result;
  }
}
