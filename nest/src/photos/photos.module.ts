import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlacesModule } from '../places/places.module';
import { TripsModule } from '../trips/trips.module';
import { Photo } from './photo.entity';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Photo]), TripsModule, PlacesModule],
  controllers: [PhotosController],
  providers: [PhotosService],
})
export class PhotosModule {}
