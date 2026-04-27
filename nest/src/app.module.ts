import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TripsModule } from './trips/trips.module';
import { PlacesModule } from './places/places.module';
import { ExpensesModule } from './expenses/expenses.module';
import { PhotosModule } from './photos/photos.module';
import { PushModule } from './push/push.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction =
          config.get<string>('NODE_ENV') === 'production';
        return {
          type: 'mariadb',
          host: config.get<string>('DB_HOST'),
          port: parseInt(config.get<string>('DB_PORT') ?? '3306', 10),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: !isProduction,
          migrationsRun: isProduction,
          migrations: isProduction ? ['dist/migrations/*.js'] : [],
          migrationsTableName: 'typeorm_migrations',
          charset: 'utf8mb4',
          timezone: '+09:00',
        };
      },
    }),
    UsersModule,
    AuthModule,
    TripsModule,
    PlacesModule,
    ExpensesModule,
    PhotosModule,
    PushModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
