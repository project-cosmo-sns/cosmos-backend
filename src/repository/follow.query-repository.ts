import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Follow } from 'src/entity/follow.entity';
import { Member } from 'src/entity/member.entity';
import { plainToInstance } from 'class-transformer';
import { PaginationRequest } from 'src/common/pagination/pagination-request';

@Injectable()
export class FollowQueryRepository {
  constructor(private readonly dataSource: DataSource) { }

  async getFollowerQuery(memberId: number, paginationRequest: PaginationRequest): Promise<GetFollowTuple[]> {
    const followerListInfo = await this.getFollowerBaseQuery(memberId)
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
      ])
      .limit(paginationRequest.take)
      .offset(paginationRequest.getSkip())
      .orderBy('follow.createdAt', paginationRequest.order)
      .getRawMany();
    return plainToInstance(GetFollowTuple, followerListInfo);
  }

  async GetFollowerTotalCount(memberId: number): Promise<number> {
    return await this.getFollowerBaseQuery(memberId).getCount();
  }

  private getFollowerBaseQuery(memberId: number) {
    return this.dataSource
      .createQueryBuilder()
      .from(Follow, 'follow')
      .innerJoin(Member, 'member', 'follow.following_member_id = member.id')
      .where('follow.follower_member_id = :memberId', { memberId })
  }

  async getFollowingQuery(memberId: number, paginationRequest: PaginationRequest): Promise<GetFollowTuple[]> {
    const followingListInfo = await this.getFollowingBaseQuery(memberId)
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
      ])
      .limit(paginationRequest.take)
      .offset(paginationRequest.getSkip())
      .orderBy('follow.createdAt', paginationRequest.order)
      .getRawMany();

    return plainToInstance(GetFollowTuple, followingListInfo);
  }

  async GetFollowingTotalCount(memberId: number): Promise<number> {
    return await this.getFollowingBaseQuery(memberId).getCount();
  }

  private getFollowingBaseQuery(memberId: number) {
    return this.dataSource
      .createQueryBuilder()
      .from(Follow, 'follow')
      .innerJoin(Member, 'member', 'follow.follower_member_id = member.id')
      .where('follow.following_member_id = :memberId', { memberId })
  }

  async getFollowerCountByMemberId(memberId: number): Promise<number> {
    const followerCount = await this.dataSource
      .createQueryBuilder()
      .from(Follow, 'follow')
      .where('follow.follower_member_id = :memberId', { memberId })
      .getCount();
    return followerCount;
  }

  async getProfileFollowingCountByMemberId(memberId: number): Promise<number> {
    const followingCount = await this.dataSource
      .createQueryBuilder()
      .from(Follow, 'follow')
      .where('follow.following_member_id = :memberId', { memberId })
      .getCount();
    return followingCount;
  }
}

export class GetFollowTuple {
  memberId!: number;
  nickname!: string;
  generation!: number;
  profileImageUrl!: string;
}
