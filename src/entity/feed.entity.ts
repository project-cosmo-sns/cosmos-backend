import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'feed' })
export class Feed {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'member_id', nullable: false })
  memberId!: number;

  @Column({ nullable: false, length: 500 })
  content!: string;

  @Column({ name: 'view_count', nullable: false })
  viewCount!: number;

  @Column({name:'emoji_count', nullable: false})
  emojiCount!: number;

  @Column({name:'comment_count', nullable: false})
  commentCount!: number;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: false })
  updatedAt!: Date;
}