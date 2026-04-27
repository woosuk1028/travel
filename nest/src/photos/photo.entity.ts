import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Place } from '../places/place.entity';
import { Trip } from '../trips/trip.entity';

@Entity('photos')
export class Photo {
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

  @Column({ name: 'file_path', length: 500 })
  filePath!: string;

  @Column({ name: 'original_name', length: 500 })
  originalName!: string;

  @Column({ name: 'mime_type', length: 100 })
  mimeType!: string;

  @Column({ type: 'int' })
  size!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  caption?: string | null;

  @Column({ name: 'taken_at', type: 'datetime', nullable: true })
  takenAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
