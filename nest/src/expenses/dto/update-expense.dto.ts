import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import type { ExpenseCategory } from '../expense.entity';
import { EXPENSE_CATEGORIES } from './create-expense.dto';

export class UpdateExpenseDto {
  @IsOptional()
  @IsNumberString()
  amount?: string;

  @IsOptional()
  @IsString()
  @Length(2, 8)
  currency?: string;

  @IsOptional()
  @IsIn(EXPENSE_CATEGORIES)
  category?: ExpenseCategory;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsInt()
  placeId?: number | null;
}
