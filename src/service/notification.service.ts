import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { GetNotificationResponseDto } from 'src/dto/response/get-notification.response.dto';
import { Notification } from 'src/entity/notification.entity';
import { NotificationQueryRepository } from 'src/repository/notification.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    private readonly notificationQueryRepository: NotificationQueryRepository,
  ) {}

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

  async confirmNotification(memberId: number, notificationId: number): Promise<void> {
    const notification = await this.notificationRepository.findOneBy({ id: notificationId });

    if (!notification) {
      throw new NotFoundException('해당 알림을 찾을 수 없습니다.');
    }

    if (notification.memberId !== memberId) {
      throw new UnauthorizedException('해당 알림에 대한 권한이 없습니다.');
    }

    notification.isConfirmed = true;

    await this.notificationRepository.save(notification);
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
