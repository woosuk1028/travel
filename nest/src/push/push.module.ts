import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../expenses/expense.entity';
import { Photo } from '../photos/photo.entity';
import { Place } from '../places/place.entity';
import { Trip } from '../trips/trip.entity';
import { PushNotificationLog } from './push-notification-log.entity';
import { PushSubscriptionEntity } from './push-subscription.entity';
import { PushController } from './push.controller';
import { PushService } from './push.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PushSubscriptionEntity,
      PushNotificationLog,
      Place,
      Expense,
      Photo,
      Trip,
    ]),
  ],
  controllers: [PushController],
  providers: [PushService],
})
export class PushModule {}
