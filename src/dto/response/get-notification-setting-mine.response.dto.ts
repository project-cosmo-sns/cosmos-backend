import { ApiProperty } from '@nestjs/swagger';

export class GetNotificationSettingMineResponseDto {
  @ApiProperty()
  isCommentNotification: boolean;
  @ApiProperty()
  isEmojiNotification: boolean;
  @ApiProperty()
  isFollowNotification: boolean;

  constructor(isCommentNotification: boolean, isEmojiNotification: boolean, isFollowNotification: boolean) {
    this.isCommentNotification = isCommentNotification;
    this.isEmojiNotification = isEmojiNotification;
    this.isFollowNotification = isFollowNotification;
  }

  static from({
    isCommentNotification,
    isEmojiNotification,
    isFollowNotification,
  }: {
    isCommentNotification: boolean;
    isEmojiNotification: boolean;
    isFollowNotification: boolean;
  }) {
    return new GetNotificationSettingMineResponseDto(isCommentNotification, isEmojiNotification, isFollowNotification);
  }
}
