import {
  IsDateString,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const TRIP_CURRENCIES = ['KRW', 'USD', 'JPY'] as const;

export class CreateTripDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsNumberString()
  budget?: string;

  @IsOptional()
  @IsIn(TRIP_CURRENCIES as readonly string[])
  budgetCurrency?: string;
}
