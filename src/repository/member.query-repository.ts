import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Transform, plainToInstance } from 'class-transformer';
import { Member } from 'src/entity/member.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class MemberQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

  async getMember(externalId: string): Promise<Member | undefined> {
    const member = await this.dataSource
      .createQueryBuilder()
      .from(Member, 'member')
      .where('member.externalId = :externalId', { externalId })
      .andWhere('member.deletedAt IS NULL')
      .select('member')
      .getOne();

    return plainToInstance(Member, member);
  }

  async getMemberIsNotDeletedById(memberId: number): Promise<Member | undefined> {
    const member = await this.dataSource
      .createQueryBuilder()
      .from(Member, 'member')
      .where('member.id = :memberId', { memberId })
      .andWhere('member.deletedAt IS NULL')
      .select('member')
      .getOne();

    return plainToInstance(Member, member);
  }

  async getNotificationSettingByMemberId(memberId: number): Promise<GetNotificationSettingTuple> {
    const notificationSetting = await this.dataSource
      .createQueryBuilder()
      .from(Member, 'member')
      .where('member.id = :memberId', { memberId })
      .andWhere('member.deletedAt IS NULL')
      .select([
        'member.isCommentNotification as isCommentNotification',
        'member.isEmojiNotification as isEmojiNotification',
        'member.isFollowNotification as isFollowNotification',
      ])
      .getRawOne();

    return plainToInstance(GetNotificationSettingTuple, notificationSetting);
  }

  async getMemberIsAdmin(memberId: number): Promise<Member | undefined> {
    const member = await this.dataSource
      .createQueryBuilder()
      .from(Member, 'member')
      .where('member.id = :memberId', { memberId })
      .andWhere('member.isAdmin = TRUE')
      .select('member')
      .getOne();
    return plainToInstance(Member, member);
  }

}

class GetNotificationSettingTuple {
  @Transform(({ value }) => Boolean(value))
  isCommentNotification: boolean;
  @Transform(({ value }) => Boolean(value))
  isEmojiNotification: boolean;
  @Transform(({ value }) => Boolean(value))
  isFollowNotification: boolean;
}
