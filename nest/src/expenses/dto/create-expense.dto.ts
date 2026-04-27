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

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'transport',
  'food',
  'lodging',
  'shopping',
  'activity',
  'other',
];

export class CreateExpenseDto {
  @IsNumberString()
  amount!: string;

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

  @IsDateString()
  paidAt!: string;

  @IsOptional()
  @IsInt()
  placeId?: number | null;
}
