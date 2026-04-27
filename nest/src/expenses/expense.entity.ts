import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Place } from '../places/place.entity';
import { Trip } from '../trips/trip.entity';

export type ExpenseCategory =
  | 'transport'
  | 'food'
  | 'lodging'
  | 'shopping'
  | 'activity'
  | 'other';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ name: 'trip_id' })
  tripId!: number;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip?: Trip;

  @Index()
  @Column({ name: 'place_id', type: 'int', nullable: true })
  placeId?: number | null;

  @ManyToOne(() => Place, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'place_id' })
  place?: Place | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ length: 8, default: 'KRW' })
  currency!: string;

  @Column({ length: 32, default: 'other' })
  category!: ExpenseCategory;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string | null;

  @Column({ name: 'paid_at', type: 'datetime' })
  paidAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
