import { Injectable } from "@nestjs/common";
import { Transform, plainToInstance } from "class-transformer";
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { Follow } from "src/entity/follow.entity";
import { Member } from "src/entity/member.entity";
import { DataSource } from "typeorm";
import { GetPostListTuple } from './post.query-repository';
import { Post } from 'src/entity/post.entity';

@Injectable()
export class ProfileQueryRepository {
  constructor(private readonly dataSource: DataSource) { }

  async getOthersProfileInfo(memberId: number, myMemberId: number): Promise<GetOthersProfileTuple> {
    const othersProfile = await this.dataSource
      .createQueryBuilder()
      .from(Member, 'member')
      .leftJoin(
        Follow,
        'follow',
        'follow.following_member_id = :myMemberId AND follow.follower_member_id = member.id', { myMemberId }
      )
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
        'member.introduce as introduce',
        'CASE WHEN follow.following_member_id IS NOT NULL THEN true ELSE false END as isFollowed',

      ])
      .where('member.id = :memberId', { memberId })
      .getRawOne()
    return plainToInstance(GetOthersProfileTuple, othersProfile);
  }

  async getMyProfileInfo(memberId: number): Promise<GetMyProfileTuple> {
    const myProfile = await this.dataSource
      .createQueryBuilder()
      .from(Member, 'member')
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
        'member.introduce as introduce',
      ])
      .where('member.id = :memberId', { memberId })
      .getRawOne()
    return plainToInstance(GetMyProfileTuple, myProfile);
  }

  async getProfileFollowerCount(memberId: number): Promise<number> {
    const followerCount = await this.dataSource
      .createQueryBuilder()
      .from(Follow, 'follow')
      .where('follow.follower_member_id = :memberId', { memberId })
      .getCount()
    return followerCount;
  }

  async getProfileFollowingCount(memberId: number): Promise<number> {
    const followingCount = await this.dataSource
      .createQueryBuilder()
      .from(Follow, 'follow')
      .where('follow.following_member_id = :memberId', { memberId })
      .getCount()
    return followingCount;
  }

  async getPostList(
    memberId: number,
    paginationRequest: PaginationRequest): Promise<GetPostListTuple[]> {
    const postListQuery = await this.getPostListBaseQuery(memberId)
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
        'post.id as postId',
        'post.title as title',
        'post.content as content',
        'post.emoji_count as emojiCount',
        'post.comment_count as commentCount',
        'post.view_count as viewCount'
      ])
      .limit(paginationRequest.take)
      .offset(paginationRequest.getSkip())
      .orderBy('post.created_at', paginationRequest.order)
      .getRawMany()
    return plainToInstance(GetPostListTuple, postListQuery);
  }

  async getAllPostListTotalCount(memberId: number,): Promise<number> {
    return await this.getPostListBaseQuery(memberId).getCount();
  }

  private getPostListBaseQuery(memberId: number) {
    return this.dataSource
      .createQueryBuilder()
      .from(Post, 'post')
      .innerJoin(Member, 'member', 'post.member_id=member.id')
      .where('post.deleted_at IS NULL')
      .andWhere('member.deleted_at IS NULL')
      .andWhere('post.member_id = :memberId', { memberId });
  }
}

export class GetOthersProfileTuple {
  memberId!: number;
  nickname!: string;
  generation!: number;
  profileImageUrl!: string;
  introduce!: string;
  followerCount!: number;
  followingCount!: number;
  @Transform(({ value }) => value === '1')
  isFollowed!: boolean;
}

export class GetMyProfileTuple {
  memberId!: number;
  nickname!: string;
  generation!: number;
  profileImageUrl!: string;
  introduce!: string;
  followerCount!: number;
  followingCount!: number;
}

export class FollowerCountTuple {
  followerCount!: number;
}

export class FollowingCountTuple {
  followingCount!: number;
}