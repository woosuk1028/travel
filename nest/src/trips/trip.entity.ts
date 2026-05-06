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
import { User } from '../users/user.entity';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ length: 200 })
  title!: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Index({ unique: true })
  @Column({ name: 'share_code', type: 'varchar', length: 16, nullable: true })
  shareCode?: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  budget?: string | null;

  @Column({
    name: 'budget_currency',
    type: 'varchar',
    length: 8,
    default: 'KRW',
  })
  budgetCurrency!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
