import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationType } from 'src/entity/common/Enums';
import { Member } from 'src/entity/member.entity';
import { Notification } from 'src/entity/notification.entity';
import { MemberQueryRepository } from 'src/repository/member.query-repository';
import { Repository } from 'typeorm';
import { MemberDomainService } from './member.domain-service';

@Injectable()
export class NotificationDomainService {
  constructor(
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    private readonly memberDomainService: MemberDomainService,
  ) {}

  async saveNotification({ receivedMemberId, sendMemberId, notificationType, content }): Promise<void> {
    try {
      if (receivedMemberId === sendMemberId) {
        return;
      }

      await this.memberDomainService.getMemberIsNotDeletedById(sendMemberId);
      const receivedMember = await this.memberDomainService.getMemberIsNotDeletedById(receivedMemberId);

      if (!this.sendNotificationCheck(receivedMember, notificationType.type)) {
        return;
      }

      const notification = new Notification();

      notification.memberId = receivedMemberId;
      notification.sendMemberId = sendMemberId;
      notification.notificationType = JSON.stringify(notificationType);
      notification.content = content;

      await this.notificationRepository.save(notification);
    } catch (e) {
      console.error(e);
    }
  }

  private sendNotificationCheck(member: Member, type: NotificationType) {
    switch (type) {
      case NotificationType.CREATE_FEED_COMMENT:
      case NotificationType.CREATE_POST_COMMENT:
        return member.isCommentNotification === true;
      case NotificationType.CREATE_FEED_EMOJI:
      case NotificationType.CREATE_POST_EMOJI:
        return member.isEmojiNotification === true;
      case NotificationType.FOLLOW:
        return member.isFollowNotification === true;
      default:
        return false;
    }
  }
}
