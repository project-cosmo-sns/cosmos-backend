import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'post_reply' })
export class PostReply {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'post_id', nullable: false })
  postId!: number;

  @Column({ name: 'comment_id', nullable: false })
  commentId!: number;

  @Column({ name: 'member_id', nullable: false })
  memberId!: number;

  @Column({ name: 'content', nullable: false, length: 300 })
  content!: string;

  @Column({ name: 'heart_count', nullable: false })
  heartCount!: number;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: false })
  updatedAt!: Date;

  setPostReplyContent(content: string) {
    this.content = content;
  }

  setPostReplyDeleted(deletedAt: Date) {
    this.deletedAt = deletedAt;
  }
}
