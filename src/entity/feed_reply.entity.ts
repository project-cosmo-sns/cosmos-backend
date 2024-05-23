import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'feed_reply' })
export class FeedReply {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'comment_id', nullable: false })
  commentId!: number;

  @Column({ name: 'member_id', nullable: false })
  memberID!: number;

  @Column({ name: 'content', nullable: false, length: 300 })
  content!: string;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt!: Date;
}
