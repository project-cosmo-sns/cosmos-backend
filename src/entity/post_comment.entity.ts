import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'post_comment' })
export class PostComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'post_id', nullable: false })
  postId!: number;

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

  setCommentInfo(content: string) {
    this.content = content;
  }

  deleteCommentInfo(deletedAt: Date) {
    this.deletedAt = deletedAt;
  }

  plusCommentHeartCount(heartCount: number) {
    this.heartCount = heartCount + 1;
  }

  minusCommentHeartCount(heartCount: number) {
    this.heartCount = heartCount - 1;
  }
}