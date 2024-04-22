import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'feed_view' })
export class FeedView {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'feed_id', nullable: false })
  feedId!: number;

  @Column({ name: 'member_id', nullable: false })
  memberId!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: false })
  updatedAt!: Date;
}