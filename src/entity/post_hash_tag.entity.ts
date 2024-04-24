import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'post_hash_tag' })
export class PostHashTag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'post_id', nullable: false })
  postId!: number;

  @Column({ name: 'hash_tag_id', nullable: false })
  hashTagId!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: false })
  updatedAt!: Date;
}