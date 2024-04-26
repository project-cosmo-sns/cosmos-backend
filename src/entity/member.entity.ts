import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SocialProvider } from './common/SocialProvider';

@Entity({
  name: 'member',
})
export class Member {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nickname', length: 45, nullable: false })
  nickname: string;

  @Column({ name: 'profile_image_url', length: 200, nullable: false })
  profileImageUrl: string;

  @Column({ name: 'generation', type: 'int', nullable: true })
  generation: number;

  @Column({ name: 'introduce', length: 200, nullable: true })
  introduce?: string;

  @Column({ name: 'is_comment_notification', type: 'boolean', nullable: false })
  isCommentNotification: boolean;

  @Column({ name: 'is_emoji_notification', type: 'boolean', nullable: false })
  isEmojiNotification: boolean;

  @Column({ name: 'is_follow_notification', type: 'boolean', nullable: false })
  isFollowNotification: boolean;

  @Column({ name: 'is_authorized', type: 'boolean', nullable: false })
  isAuthorized: boolean;

  @Column({ name: 'social_provider', type: 'enum', enum: SocialProvider, nullable: false })
  socialProvider!: SocialProvider;

  @Column({ name: 'external_id', length: 100, nullable: true, type: 'varchar' })
  externalId: string | null;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: false })
  updatedAt!: Date;

  setProfileInfo(nickname: string, profileImageUrl: string) {
    this.nickname = nickname;
    this.profileImageUrl = profileImageUrl;
  }

  // setMyPageInfo(
  //   nickname?: string,
  //   profileImageUrl?: string,
  //   position?: string,
  //   career?: number,
  //   introduce?: string,
  //   stack?: string,
  //   link?: string,
  // ) {
  //   this.nickname = nickname;
  //   this.profileImageUrl = profileImageUrl;
  //   this.position = position;
  //   this.career = career;
  //   this.introduce = introduce;
  //   this.stack = stack;
  //   this.link = link;
  // }

  setDelete(deletedAt: Date) {
    this.externalId = null;
    this.deletedAt = deletedAt;
  }
}
