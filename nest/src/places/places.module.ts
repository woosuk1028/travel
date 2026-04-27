import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsModule } from '../trips/trips.module';
import { Place } from './place.entity';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';

@Module({
  imports: [TypeOrmModule.forFeature([Place]), TripsModule],
  controllers: [PlacesController],
  providers: [PlacesService],
  exports: [PlacesService],
})
export class PlacesModule {}
