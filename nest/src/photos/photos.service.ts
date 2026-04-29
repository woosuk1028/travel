import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { PlacesService } from '../places/places.service';
import { TripsService } from '../trips/trips.service';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { Photo } from './photo.entity';

@Injectable()
export class PhotosService {
  private readonly logger = new Logger(PhotosService.name);

  constructor(
    @InjectRepository(Photo) private readonly photos: Repository<Photo>,
    private readonly tripsService: TripsService,
    private readonly placesService: PlacesService,
  ) {}

  async list(userId: number, tripId: number) {
    await this.tripsService.assertAccessible(userId, tripId);
    return this.photos.find({
      where: { tripId },
      order: { takenAt: 'DESC', id: 'DESC' },
    });
  }

  async findOne(userId: number, tripId: number, id: number) {
    await this.tripsService.assertAccessible(userId, tripId);
    const photo = await this.photos.findOne({ where: { id, tripId } });
    if (!photo) throw new NotFoundException('Photo not found');
    return photo;
  }

  async upload(
    userId: number,
    tripId: number,
    file: Express.Multer.File,
    dto: UploadPhotoDto,
  ) {
    try {
      await this.tripsService.assertAccessible(userId, tripId);
      if (dto.placeId) {
        await this.placesService.assertBelongsToTrip(tripId, dto.placeId);
      }
    } catch (err) {
      await this.deleteFile(file.path);
      throw err;
    }

    const photo = this.photos.create({
      tripId,
      placeId: dto.placeId ?? null,
      filePath: `/uploads/${file.filename}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      caption: dto.caption,
      takenAt: dto.takenAt ? new Date(dto.takenAt) : null,
    });
    return this.photos.save(photo);
  }

  async update(
    userId: number,
    tripId: number,
    id: number,
    dto: UpdatePhotoDto,
  ) {
    await this.tripsService.assertAccessible(userId, tripId);
    const photo = await this.photos.findOne({ where: { id, tripId } });
    if (!photo) throw new NotFoundException('Photo not found');
    if (dto.placeId !== undefined && dto.placeId !== null) {
      await this.placesService.assertBelongsToTrip(tripId, dto.placeId);
    }
    if (dto.caption !== undefined) photo.caption = dto.caption;
    if (dto.takenAt !== undefined) photo.takenAt = new Date(dto.takenAt);
    if (dto.placeId !== undefined) photo.placeId = dto.placeId;
    await this.photos.save(photo);
    return this.findOne(userId, tripId, id);
  }

  async remove(userId: number, tripId: number, id: number, uploadsRoot: string) {
    await this.tripsService.assertAccessible(userId, tripId);
    const photo = await this.photos.findOne({ where: { id, tripId } });
    if (!photo) throw new NotFoundException('Photo not found');
    await this.photos.remove(photo);
    const filename = photo.filePath.replace(/^\/uploads\//, '');
    await this.deleteFile(join(uploadsRoot, filename));
    return { id };
  }

  private async deleteFile(absolutePath: string) {
    try {
      await fs.unlink(absolutePath);
    } catch (err) {
      this.logger.warn(`Failed to delete file ${absolutePath}: ${(err as Error).message}`);
    }
  }
}
