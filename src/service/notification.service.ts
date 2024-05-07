import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { GetNotificationSettingMineResponseDto } from 'src/dto/response/get-notification-setting-mine.response.dto';
import { GetNotificationResponseDto } from 'src/dto/response/get-notification.response.dto';
import { NotificationSettingType } from 'src/entity/common/Enums';
import { Member } from 'src/entity/member.entity';
import { Notification } from 'src/entity/notification.entity';
import { MemberQueryRepository } from 'src/repository/member.query-repository';
import { NotificationQueryRepository } from 'src/repository/notification.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Member) private readonly memberRepository: Repository<Member>,
    private readonly notificationQueryRepository: NotificationQueryRepository,
    private readonly memberQueryRepository: MemberQueryRepository,
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

  async getNotificationSettingMine(memberId: number): Promise<GetNotificationSettingMineResponseDto> {
    const notificationSetting = await this.memberQueryRepository.getNotificationSettingByMemberId(memberId);

    if (!notificationSetting) {
      throw new NotFoundException('해당 회원을 찾을 수 없습니다.');
    }

    return GetNotificationSettingMineResponseDto.from(notificationSetting);
  }

  async acceptNotificationSetting(memberId: number, notificationSettingType: NotificationSettingType): Promise<void> {
    const member = await this.memberQueryRepository.getMemberIsNotDeletedById(memberId);

    if (!member) {
      throw new NotFoundException('해당 회원을 찾을 수 없습니다.');
    }

    member.setAcceptNotificationSetting(notificationSettingType);

    await this.memberRepository.save(member);
  }

  async rejectNotificationSetting(memberId: number, notificationSettingType: NotificationSettingType): Promise<void> {
    const member = await this.memberQueryRepository.getMemberIsNotDeletedById(memberId);

    if (!member) {
      throw new NotFoundException('해당 회원을 찾을 수 없습니다.');
    }

    member.setRejectNotificationSetting(notificationSettingType);

    await this.memberRepository.save(member);
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
