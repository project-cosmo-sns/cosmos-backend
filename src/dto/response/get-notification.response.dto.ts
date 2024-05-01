import { ApiProperty } from '@nestjs/swagger';
import { NotificationDto, SendMemberDto } from 'src/service/notification.service';

export class GetNotificationResponseDto {
  @ApiProperty({
    type: {
      profileImageUrl: { type: 'string' },
    },
  })
  sendMember: SendMemberDto;
  @ApiProperty({
    type: {
      id: { type: 'number' },
      content: { type: 'string' },
      notificationType: { type: 'object' },
      isConfirmed: { type: 'boolean' },
      createdAt: { type: 'string' },
    },
  })
  notification: NotificationDto;

  constructor(sendMember: SendMemberDto, notification: NotificationDto) {
    this.sendMember = sendMember;
    this.notification = notification;
  }

  static from({ sendMember, notification }: { sendMember: SendMemberDto; notification: NotificationDto }) {
    return new GetNotificationResponseDto(sendMember, notification);
  }
}
