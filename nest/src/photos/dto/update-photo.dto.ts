import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdatePhotoDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @IsOptional()
  @IsDateString()
  takenAt?: string;

  @IsOptional()
  @IsInt()
  placeId?: number | null;
}
