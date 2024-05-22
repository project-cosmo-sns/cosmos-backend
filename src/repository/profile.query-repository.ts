import { Injectable } from '@nestjs/common';
import { Transform, plainToInstance } from 'class-transformer';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { Follow } from 'src/entity/follow.entity';
import { Member } from 'src/entity/member.entity';
import { DataSource } from 'typeorm';
import { GetPostTuple } from './post.query-repository';
import { Post } from 'src/entity/post.entity';
import { Feed } from 'src/entity/feed.entity';
import { GetFeedTuple } from './feed.query-repository';
import { AuthorizationStatusType } from 'src/entity/common/Enums';
import { PostScrap } from 'src/entity/post_scrap.entity';

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
        'follow.following_member_id = :myMemberId AND follow.follower_member_id = member.id',
        { myMemberId },
      )
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
        'member.introduce as introduce',
        'member.authorization_status as authorizationStatus',
        'CASE WHEN follow.following_member_id IS NOT NULL THEN true ELSE false END as isFollowed',
      ])
      .where('member.id = :memberId', { memberId })
      .getRawOne();
    return plainToInstance(GetOthersProfileTuple, othersProfile);
  }

  async getMyProfileInfo(memberId: number): Promise<GetMyProfileTuple> {
    const myProfile = await this.dataSource
      .createQueryBuilder()
      .from(Member, 'member')
      .select([
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
        'member.introduce as introduce',
        'member.authorization_status as authorizationStatus'
      ])
      .where('member.id = :memberId', { memberId })
      .getRawOne();
    return plainToInstance(GetMyProfileTuple, myProfile);
  }

  async getPostList(memberId: number, paginationRequest: PaginationRequest, myId: number): Promise<GetPostTuple[]> {
    const postListQuery = await this.getPostListBaseQuery(memberId, myId)
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
        'post.view_count as viewCount',
        'post.created_at as createdAt',
        'CASE WHEN post_scrap.id IS NOT NULL THEN \'1\' ELSE \'0\' END as isScraped',
      ])
      .limit(paginationRequest.take)
      .offset(paginationRequest.getSkip())
      .orderBy('post.created_at', paginationRequest.order)
      .getRawMany();
    return plainToInstance(GetPostTuple, postListQuery);
  }

  async getAllPostListTotalCount(memberId: number, myId: number): Promise<number> {
    return await this.getPostListBaseQuery(memberId, myId).getCount();
  }

  private getPostListBaseQuery(memberId: number, myId: number) {
    return this.dataSource
      .createQueryBuilder()
      .from(Post, 'post')
      .innerJoin(Member, 'member', 'post.member_id=member.id')
      .leftJoin(PostScrap, 'post_scrap', 'post_scrap.post_id = post.id AND post_scrap.member_id = :myId', { myId })
      .where('post.deleted_at IS NULL')
      .andWhere('member.deleted_at IS NULL')
      .andWhere('post.member_id = :memberId', { memberId });
  }

  async getFeedList(memberId: number, paginationRequest: PaginationRequest): Promise<GetFeedTuple[]> {
    const feedList = await this.getFeedBaseQuery(memberId)
      .select([
        'member.id as writerId',
        'member.nickname as writerNickname',
        'member.generation as writerGeneration',
        'member.profileImageUrl as writerProfileImageUrl',
        'feed.id as feedId',
        'feed.content as feedContent',
        'feed.viewCount as feedViewCount',
        'feed.commentCount as feedCommentCount',
        'feed.emojiCount as feedEmojiCount',
        'feed.createdAt as feedCreatedAt',
      ])
      .limit(paginationRequest.take)
      .offset(paginationRequest.getSkip())
      .orderBy('feed.createdAt', paginationRequest.order)
      .getRawMany();

    return plainToInstance(GetFeedTuple, feedList);
  }

  async getFeedListCount(memberId: number): Promise<number> {
    return await this.getFeedBaseQuery(memberId).getCount();
  }

  private getFeedBaseQuery(memberId: number) {
    return this.dataSource
      .createQueryBuilder()
      .from(Feed, 'feed')
      .innerJoin(Member, 'member', 'feed.memberId = member.id')
      .where('feed.deletedAt IS NULL')
      .andWhere('member.deletedAt IS NULL')
      .andWhere('feed.member_id = :memberId', { memberId });
  }
}

export class GetProfilePostTuple {
  memberId!: number;
  nickname!: string;
  generation!: number;
  profileImageUrl!: string;
  createdAt!: Date;
  postId!: number;
  category!: string;
  title!: string;
  content!: string;
  emojiCount!: number;
  commentCount!: number;
  viewCount!: number;
  @Transform(({ value }) => value === '1')
  isScraped!: boolean;
}

export class GetOthersProfileTuple {
  memberId!: number;
  nickname!: string;
  generation!: number;
  profileImageUrl!: string;
  introduce!: string;
  followerCount!: number;
  followingCount!: number;
  authorizationStatus!: AuthorizationStatusType;
  @Transform(({ value }) => value === '1')
  isFollowed!: boolean;
}

export class GetMyProfileTuple {
  nickname!: string;
  generation!: number;
  profileImageUrl!: string;
  introduce!: string;
  followerCount!: number;
  followingCount!: number;
  authorizationStatus!: AuthorizationStatusType;
}

export class FollowerCountTuple {
  followerCount!: number;
}

export class FollowingCountTuple {
  followingCount!: number;
}


