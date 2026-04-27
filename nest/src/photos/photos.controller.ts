import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { PhotosService } from './photos.service';

type AuthRequest = { user: { id: number } };

export const UPLOADS_ROOT = join(process.cwd(), 'uploads');
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = /^image\/(jpeg|png|gif|webp|heic|heif)$/i;

@UseGuards(JwtAuthGuard)
@Controller('trips/:tripId/photos')
export class PhotosController {
  constructor(private readonly photos: PhotosService) {}

  @Get()
  list(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
  ) {
    return this.photos.list(req.user.id, tripId);
  }

  @Get(':id')
  findOne(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.photos.findOne(req.user.id, tripId, id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_ROOT,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.test(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Only image files are allowed'), false);
      },
      limits: { fileSize: MAX_BYTES },
    }),
  )
  upload(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadPhotoDto,
  ) {
    if (!file) throw new BadRequestException('file field is required');
    return this.photos.upload(req.user.id, tripId, file, dto);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePhotoDto,
  ) {
    return this.photos.update(req.user.id, tripId, id, dto);
  }

  @Delete(':id')
  remove(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.photos.remove(req.user.id, tripId, id, UPLOADS_ROOT);
  }
}
