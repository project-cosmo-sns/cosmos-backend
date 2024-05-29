import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'feed_reply_heart' })
export class FeedReplyHeart {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'feed_id', nullable: false })
  feedId!: number;

  @Column({ name: 'reply_id', nullable: false })
  replyId!: number;

  @Column({ name: 'member_id', nullable: false })
  memberId!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: false })
  updatedAt!: Date;
}