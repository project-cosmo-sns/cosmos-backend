import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/entity/notification.entity';
import { MemberQueryRepository } from 'src/repository/member.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationDomainService {
  constructor(
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    private readonly memberQueryRepository: MemberQueryRepository,
  ) {}

  async postNotification(receivedMemberId, sendMemberId, notificationType) {
    if (receivedMemberId === sendMemberId) {
      return;
    }

    const sendMember = await this.memberQueryRepository.getMemberIsNotDeletedById(sendMemberId);

    if (!sendMember) {
      throw new NotFoundException('해당 회원을 찾을 수 없습니다.');
    }

    const notification = new Notification();

    notification.memberId = receivedMemberId;
    notification.sendMemberId = sendMemberId;
    notification.notificationType = JSON.stringify(notificationType);
    notification.content = `${sendMember.nickname}님이 회원님의 피드에 댓글을 남겼습니다.`;

    await this.notificationRepository.save(notification);
  }
}
