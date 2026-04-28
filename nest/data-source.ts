import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Expense } from './src/expenses/expense.entity';
import { Photo } from './src/photos/photo.entity';
import { Place } from './src/places/place.entity';
import { PushNotificationLog } from './src/push/push-notification-log.entity';
import { PushSubscriptionEntity } from './src/push/push-subscription.entity';
import { TripMember } from './src/trips/trip-member.entity';
import { Trip } from './src/trips/trip.entity';
import { User } from './src/users/user.entity';

export default new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  charset: 'utf8mb4',
  timezone: '+09:00',
  entities: [
    User,
    Trip,
    TripMember,
    Place,
    Expense,
    Photo,
    PushSubscriptionEntity,
    PushNotificationLog,
  ],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations',
});
