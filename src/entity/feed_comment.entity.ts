import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'feed_comment' })
export class FeedComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'feed_id', nullable: false })
  feedId!: number;

  @Column({ name: 'member_id', nullable: false })
  memberId!: number;

  @Column({ length: 300, nullable: false })
  content!: string;

  @Column({ name: 'heart_count', nullable: false })
  heartCount!: number;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: false })
  updatedAt!: Date;

  setCommentContent(content: string) {
    this.content = content;
  }
}
