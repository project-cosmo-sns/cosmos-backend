import { ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationDomainService } from 'src/\bdomain-service/notification.domain-service';
import { GetFollowerList } from 'src/dto/get-follower-list';
import { GetFollowingList } from 'src/dto/get-following-list';
import { NotificationType } from 'src/entity/common/Enums';
import { Follow } from 'src/entity/follow.entity';
import { Member } from 'src/entity/member.entity';
import { FollowQueryRepository } from 'src/repository/follow.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Member) private readonly memberRepository: Repository<Member>,
    @InjectRepository(Follow) private readonly followRepository: Repository<Follow>,
    private readonly followQueryRepository: FollowQueryRepository,
    private readonly notificationDomainService: NotificationDomainService,
  ) {}

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

    this.notificationDomainService.postNotification(followingMemberId, followerMemberId, {
      type: NotificationType.FOLLOW,
      followMemberId: followerMemberId,
    });
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

  async getFollowerLists(memberId: number) {
    const followerListTuples = await this.followQueryRepository.getFollowerQuery(memberId);
    const followerList = followerListTuples.map((follower) => GetFollowerList.from(follower));
    return followerList;
  }

  async getFollowingLists(memberId: number) {
    const followingListTuples = await this.followQueryRepository.getFollowingQuery(memberId);
    const followingList = followingListTuples.map((following) => GetFollowingList.from(following));
    return followingList;
  }
}
