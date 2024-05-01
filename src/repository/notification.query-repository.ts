import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { Member } from 'src/entity/member.entity';
import { Notification } from 'src/entity/notification.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class NotificationQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getNotificationList(memberId: number, paginationRequest: PaginationRequest): Promise<GetNotificationTuple[]> {
    const notificationList = await this.getNotificationBaseQuery(memberId)
      .select([
        'notification.id as notificationId',
        'notification.content as content',
        'notification.notificationType as notificationType',
        'notification.createdAt as createdAt',
        'member.profileImageUrl as profileImageUrl',
      ])
      .limit(paginationRequest.take)
      .offset(paginationRequest.getSkip())
      .orderBy('notification.createdAt', paginationRequest.order)
      .getRawMany();

    return plainToInstance(GetNotificationTuple, notificationList);
  }

  async getNotificationListCount(memberId: number): Promise<number> {
    return await this.getNotificationBaseQuery(memberId).getCount();
  }

  private getNotificationBaseQuery(memberId) {
    return this.dataSource
      .createQueryBuilder()
      .from(Notification, 'notification')
      .innerJoin(Member, 'member', 'notification.memberId = member.id')
      .where('notification.memberId = :memberId', { memberId });
  }
}

class GetNotificationTuple {
  profileImageUrl: string;
  notificationId: number;
  content: string;
  notificationType: string;
  createdAt: Date;
}
