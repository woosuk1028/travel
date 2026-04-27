import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

type AuthRequest = { user: { id: number } };

@UseGuards(JwtAuthGuard)
@Controller('trips/:tripId/expenses')
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get()
  list(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
  ) {
    return this.expenses.list(req.user.id, tripId);
  }

  @Get(':id')
  findOne(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.expenses.findOne(req.user.id, tripId, id);
  }

  @Post()
  create(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expenses.create(req.user.id, tripId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expenses.update(req.user.id, tripId, id, dto);
  }

  @Delete(':id')
  remove(
    @Req() req: AuthRequest,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.expenses.remove(req.user.id, tripId, id);
  }
}
