import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'member_id', nullable: false })
  memberId!: number;

  @Column({ name: 'feed_id', nullable: true })
  feedId?: number;

  @Column({ name: 'post_id', nullable: true })
  postId?: number;

  @Column({ name: 'notification_type', nullable: false, length: 45 })
  notificationType!: string;

  @Column({ nullable: false, length: 200 })
  content!: string;

  @Column({ name: 'is_confirmed', nullable: false })
  isConfirmed!: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: false })
  updatedAt!: Date;
}