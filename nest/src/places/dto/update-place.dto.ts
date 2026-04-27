import {
  IsDateString,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdatePlaceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsNumberString()
  lat?: string;

  @IsOptional()
  @IsNumberString()
  lng?: string;

  @IsOptional()
  @IsDateString()
  visitDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  dayOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  memo?: string;
}
