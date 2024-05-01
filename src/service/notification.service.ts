import { Injectable } from '@nestjs/common';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { GetNotificationResponseDto } from 'src/dto/response/get-notification.response.dto';
import { NotificationQueryRepository } from 'src/repository/notification.query-repository';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationQueryRepository: NotificationQueryRepository) {}

  async getNotificationList(
    memberId: number,
    paginationRequest: PaginationRequest,
  ): Promise<{ notificationList: GetNotificationResponseDto[]; totalCount: number }> {
    const getNotificationListTuple = await this.notificationQueryRepository.getNotificationList(
      memberId,
      paginationRequest,
    );
    const totalCount = await this.notificationQueryRepository.getNotificationListCount(memberId);

    const notificationList = getNotificationListTuple.map((item) => {
      const sendMember = {
        profileImageUrl: item.profileImageUrl,
      };

      const notification = {
        id: item.notificationId,
        content: item.content,
        notificationType: JSON.parse(item.notificationType),
        isConfirmed: item.isConfirmed,
        createdAt: item.createdAt,
      };

      return GetNotificationResponseDto.from({ sendMember, notification });
    });

    return { notificationList, totalCount };
  }
}

export class SendMemberDto {
  profileImageUrl: string;
}

export class NotificationDto {
  id: number;
  content: string;
  notificationType: Record<string, string>;
  isConfirmed: boolean;
  createdAt: Date;
}
