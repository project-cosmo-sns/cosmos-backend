import { ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { GetFollowerList } from 'src/dto/get-follower-list';
import { GetFollowingList } from 'src/dto/get-following-list';
import { NotificationType } from 'src/entity/common/Enums';
import { Follow } from 'src/entity/follow.entity';
import { Member } from 'src/entity/member.entity';
import { Notification } from 'src/entity/notification.entity';
import { FollowQueryRepository } from 'src/repository/follow.query-repository';
import { MemberQueryRepository } from 'src/repository/member.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Member) private readonly memberRepository: Repository<Member>,
    @InjectRepository(Follow) private readonly followRepository: Repository<Follow>,
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    private readonly followQueryRepository: FollowQueryRepository,
    private readonly memberQueryRepository: MemberQueryRepository,
  ) { }

  async followMember(followingMemberId: number, followerMemberId: number): Promise<void> {
    const followInfo = await this.followRepository.findOneBy({ followerMemberId, followingMemberId });
    if (followInfo !== null) {
      throw new ConflictException('중복 데이터입니다.');
    }
    const memberInfo = await this.memberRepository.findOneBy({ id: followingMemberId });
    if (memberInfo?.deletedAt !== null) {
      throw new GoneException('탈퇴한 유저입니다.');
    }
    await this.followRepository.save({ followerMemberId, followingMemberId });

    // this.followNotification(followingMemberId, followerMemberId);
  }

  async unFollowMember(followingMemberId: number, followerMemberId: number): Promise<void> {
    const followInfo = await this.followRepository.findOneBy({ followerMemberId, followingMemberId });
    if (!followInfo) {
      throw new NotFoundException('팔로우 되어 있지 않습니다.');
    }
    const memberInfo = await this.memberRepository.findOneBy({ id: followingMemberId });
    if (memberInfo?.deletedAt !== null) {
      throw new GoneException('탈퇴한 유저입니다.');
    }
    await this.followRepository.remove(followInfo);
  }

  async getFollowerLists(memberId: number, paginationRequest: PaginationRequest) {
    const followerListTuples = await this.followQueryRepository.getFollowerQuery(memberId, paginationRequest);
    const totalCount = await this.followQueryRepository.GetFollowerTotalCount(memberId);
    const followerList = followerListTuples.map((follower) => GetFollowerList.from(follower));
    return { followerList, totalCount };
  }

  async getFollowingLists(memberId: number, paginationRequest: PaginationRequest) {
    const followingListTuples = await this.followQueryRepository.getFollowingQuery(memberId, paginationRequest);
    const totalCount = await this.followQueryRepository.GetFollowingTotalCount(memberId);
    const followingList = followingListTuples.map((following) => GetFollowingList.from(following));
    return { followingList, totalCount };
  }

  private async followNotification(followingMemberId, followerMemberId) {
    try {
      const followerMember = await this.memberQueryRepository.getMemberIsNotDeletedById(followerMemberId);

      if (!followerMember) {
        throw new NotFoundException('해당 회원을 찾을 수 없습니다.');
      }

      const notification = new Notification();

      notification.memberId = followingMemberId;
      notification.sendMemberId = followerMemberId;
      notification.notificationType = JSON.stringify({
        type: NotificationType.FOLLOW,
        followerMemberId,
      });
      notification.content = `${followerMember.nickname}님이 회원님을 팔로우했습니다.`;

      await this.notificationRepository.save(notification);
    } catch (e) {
      console.error(e);
    }
  }
}
