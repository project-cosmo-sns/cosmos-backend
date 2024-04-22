import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'hash_tag' })
export class HashTag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'tag_name', nullable: false, length: 45 })
  tagName!: string;

  @Column({ nullable: false, length: 10 })
  color!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: false })
  updatedAt!: Date;
}