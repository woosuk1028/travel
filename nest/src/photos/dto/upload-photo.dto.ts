import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UploadPhotoDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @IsOptional()
  @IsDateString()
  takenAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  placeId?: number;
}
