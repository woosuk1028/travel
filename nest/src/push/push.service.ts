import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import * as webpush from 'web-push';
import { Expense } from '../expenses/expense.entity';
import { Photo } from '../photos/photo.entity';
import { Place } from '../places/place.entity';
import { Trip } from '../trips/trip.entity';
import {
  PushItemType,
  PushNotificationLog,
} from './push-notification-log.entity';
import { PushSubscriptionEntity } from './push-subscription.entity';

interface UpcomingItem {
  type: PushItemType;
  id: number;
  tripId: number;
  userId: number;
  tripTitle: string;
  label: string;
  whenIso: string;
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private vapidConfigured = false;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(PushSubscriptionEntity)
    private readonly subs: Repository<PushSubscriptionEntity>,
    @InjectRepository(PushNotificationLog)
    private readonly logs: Repository<PushNotificationLog>,
    @InjectRepository(Place) private readonly places: Repository<Place>,
    @InjectRepository(Expense)
    private readonly expenses: Repository<Expense>,
    @InjectRepository(Photo) private readonly photos: Repository<Photo>,
    @InjectRepository(Trip) private readonly trips: Repository<Trip>,
  ) {}

  onModuleInit() {
    const pub = this.config.get<string>('VAPID_PUBLIC_KEY');
    const priv = this.config.get<string>('VAPID_PRIVATE_KEY');
    const subject =
      this.config.get<string>('VAPID_SUBJECT') ?? 'mailto:admin@example.com';
    if (pub && priv) {
      webpush.setVapidDetails(subject, pub, priv);
      this.vapidConfigured = true;
      this.logger.log('Web Push VAPID configured');
    } else {
      this.logger.warn(
        'VAPID keys missing — push notifications will not be sent',
      );
    }
  }

  getPublicKey(): string | null {
    return this.config.get<string>('VAPID_PUBLIC_KEY') ?? null;
  }

  async subscribe(
    userId: number,
    input: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
      userAgent?: string;
    },
  ) {
    const existing = await this.subs.findOne({
      where: { endpoint: input.endpoint },
    });
    if (existing) {
      existing.userId = userId;
      existing.p256dh = input.keys.p256dh;
      existing.auth = input.keys.auth;
      existing.userAgent = input.userAgent ?? existing.userAgent;
      return this.subs.save(existing);
    }
    const sub = this.subs.create({
      userId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent: input.userAgent,
    });
    return this.subs.save(sub);
  }

  async unsubscribe(userId: number, endpoint: string) {
    await this.subs.delete({ userId, endpoint });
    return { ok: true };
  }

  /** Runs every minute. Finds items starting in 4–6 min and pushes one alert each. */
  @Cron(CronExpression.EVERY_MINUTE)
  async dispatchUpcomingReminders() {
    if (!this.vapidConfigured) {
      this.logger.warn('cron tick: VAPID not configured, skipping');
      return;
    }

    const now = new Date();
    const from = new Date(now.getTime() + 4 * 60 * 1000);
    const to = new Date(now.getTime() + 6 * 60 * 1000);

    this.logger.log(
      `cron tick: now=${now.toISOString()} window=[${from.toISOString()}, ${to.toISOString()})`,
    );

    try {
      const items = await this.findUpcomingItems(from, to);
      this.logger.log(`cron tick: matched ${items.length} item(s)`);
      for (const item of items) {
        await this.notifyOne(item);
      }
    } catch (err) {
      this.logger.error(
        `dispatchUpcomingReminders failed: ${(err as Error).message}`,
      );
    }
  }

  private async findUpcomingItems(
    from: Date,
    to: Date,
  ): Promise<UpcomingItem[]> {
    const out: UpcomingItem[] = [];

    const placeRows = await this.places.find({
      where: { visitAt: Between(from, to) },
    });
    for (const p of placeRows) {
      if (!p.visitAt) continue;
      const trip = await this.trips.findOne({ where: { id: p.tripId } });
      if (!trip) continue;
      out.push({
        type: 'place',
        id: p.id,
        tripId: p.tripId,
        userId: trip.userId,
        tripTitle: trip.title,
        label: p.name,
        whenIso: new Date(p.visitAt).toISOString(),
      });
    }

    const expenseRows = await this.expenses.find({
      where: { paidAt: Between(from, to) },
    });
    for (const e of expenseRows) {
      const trip = await this.trips.findOne({ where: { id: e.tripId } });
      if (!trip) continue;
      out.push({
        type: 'expense',
        id: e.id,
        tripId: e.tripId,
        userId: trip.userId,
        tripTitle: trip.title,
        label: e.description ?? `${e.amount} ${e.currency}`,
        whenIso: new Date(e.paidAt).toISOString(),
      });
    }

    const photoRows = await this.photos.find({
      where: { takenAt: Between(from, to) },
    });
    for (const ph of photoRows) {
      if (!ph.takenAt) continue;
      const trip = await this.trips.findOne({ where: { id: ph.tripId } });
      if (!trip) continue;
      out.push({
        type: 'photo',
        id: ph.id,
        tripId: ph.tripId,
        userId: trip.userId,
        tripTitle: trip.title,
        label: ph.caption ?? ph.originalName,
        whenIso: new Date(ph.takenAt).toISOString(),
      });
    }

    return out;
  }

  private async notifyOne(item: UpcomingItem) {
    // Idempotency: never send the same (type, id, kind) twice.
    try {
      await this.logs.insert({
        itemType: item.type,
        itemId: item.id,
        kind: 'upcoming_5min',
      });
    } catch {
      return;
    }

    const subs = await this.subs.find({ where: { userId: item.userId } });
    if (subs.length === 0) return;

    const typeLabel: Record<PushItemType, string> = {
      place: '장소',
      expense: '지출',
      photo: '사진',
    };

    const payload = JSON.stringify({
      title: '5분 후 일정',
      body: `${typeLabel[item.type]} · ${item.label} — 일정 잘 지켜지고 있나요?`,
      url: `/trips/${item.tripId}`,
      tag: `${item.type}-${item.id}-upcoming`,
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          // expired or invalid — clean up
          await this.subs.delete({ id: sub.id });
        } else {
          this.logger.warn(
            `push to ${sub.endpoint.slice(0, 40)}... failed: ${
              (err as Error).message
            }`,
          );
        }
      }
    }
    
  }
}
