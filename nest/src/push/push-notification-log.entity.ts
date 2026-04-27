import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export type PushItemType = 'place' | 'expense' | 'photo';
export type PushKind = 'upcoming_5min';

@Entity('push_notification_log')
@Unique(['itemType', 'itemId', 'kind'])
export class PushNotificationLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'item_type', type: 'varchar', length: 16 })
  itemType!: PushItemType;

  @Column({ name: 'item_id', type: 'int' })
  itemId!: number;

  @Column({ type: 'varchar', length: 32 })
  kind!: PushKind;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt!: Date;
}
