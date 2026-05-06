import {
  IsDateString,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { TRIP_CURRENCIES } from './create-trip.dto';

export class UpdateTripDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsNumberString()
  budget?: string | null;

  @IsOptional()
  @IsIn(TRIP_CURRENCIES as readonly string[])
  budgetCurrency?: string;
}
