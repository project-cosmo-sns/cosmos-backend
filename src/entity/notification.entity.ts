import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'member_id', nullable: false })
  memberId!: number;

  @Column({ name: 'send_member_id', nullable: false })
  sendMemberId!: number;

  @Column({ name: 'notification_type', nullable: false, length: 100 })
  notificationType!: string;

  @Column({ nullable: false, length: 200 })
  content!: string;

  @Column({ name: 'is_confirmed', nullable: false })
  isConfirmed!: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: false })
  updatedAt!: Date;

  confirmNotification() {
    this.isConfirmed = true;
  }
}
