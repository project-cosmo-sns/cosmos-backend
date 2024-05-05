import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'follow' })
export class Follow {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'following_member_id', nullable: false })
  followingMemberId!: number;

  @Column({ name: 'follower_member_id', nullable: false })
  followerMemberId!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: false })
  updatedAt!: Date;
}
