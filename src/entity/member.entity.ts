import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SocialProvider } from './common/SocialProvider';
import { AuthorizationStatusType, NotificationSettingType } from './common/Enums';

@Entity({
  name: 'member',
})
export class Member {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nickname', length: 45, nullable: false })
  nickname: string;

  @Column({ name: 'profile_image_url', length: 200, nullable: true })
  profileImageUrl?: string;

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

  @Column({ name: 'authorization_status', type: 'enum', enum: AuthorizationStatusType, nullable: false })
  authorizationStatus: AuthorizationStatusType;

  @Column({ name: 'is_admin', type: 'boolean', nullable: false })
  isAdmin: boolean;

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

  setProfileInfo(nickname: string, profileImageUrl: string, introduce: string) {
    this.nickname = nickname;
    this.profileImageUrl = profileImageUrl;
    this.introduce = introduce;
  }

  setDelete(deletedAt: Date) {
    this.externalId = null;
    this.deletedAt = deletedAt;
  }

  setAcceptNotificationSetting(notificationSettingType: NotificationSettingType) {
    switch (notificationSettingType) {
      case NotificationSettingType.COMMENT:
        this.isCommentNotification = true;
        break;
      case NotificationSettingType.EMOJI:
        this.isEmojiNotification = true;
        break;
      case NotificationSettingType.FOLLOW:
        this.isFollowNotification = true;
        break;
    }
  }

  setRejectNotificationSetting(notificationSettingType: NotificationSettingType) {
    switch (notificationSettingType) {
      case NotificationSettingType.COMMENT:
        this.isCommentNotification = false;
        break;
      case NotificationSettingType.EMOJI:
        this.isEmojiNotification = false;
        break;
      case NotificationSettingType.FOLLOW:
        this.isFollowNotification = false;
        break;
    }
  }

  setIsAuthorized() {
    this.isAuthorized = true;
  }

  setAuthorizationAccept() {
    this.authorizationStatus = AuthorizationStatusType.ACCEPT;
  }

  setAuthorizationDecline() {
    this.authorizationStatus = AuthorizationStatusType.NONE;
  }
}
