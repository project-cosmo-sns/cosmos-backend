import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AuthorizationJudgeType } from './common/Enums';

@Entity({ name: 'authorization' })
export class Authorization {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'member_id', nullable: false })
  memberId!: number;

  @Column({ name: 'generation', nullable: false })
  generation!: number;

  @Column({ name: 'image_url', nullable: false, length: 200 })
  imageUrl!: string;

  @Column({ name: 'check_status', type: 'enum', enum: AuthorizationJudgeType, nullable: false })
  checkStatus: AuthorizationJudgeType;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: false })
  updatedAt!: Date;

  setCheckStatusAccept() {
    this.checkStatus = AuthorizationJudgeType.ACCEPT;
  }

  setCheckStatusDecline() {
    this.checkStatus = AuthorizationJudgeType.DECLINE;
  }
}
