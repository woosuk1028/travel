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
import { Trip } from '../trips/trip.entity';

@Entity('places')
export class Place {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ name: 'trip_id' })
  tripId!: number;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip?: Trip;

  @Column({ length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng?: string | null;

  @Column({ name: 'visit_date', type: 'date', nullable: true })
  visitDate?: string | null;

  @Column({ name: 'day_order', type: 'int', default: 0 })
  dayOrder!: number;

  @Column({ type: 'text', nullable: true })
  memo?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
