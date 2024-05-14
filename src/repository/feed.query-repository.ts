import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Transform, plainToInstance } from 'class-transformer';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { ListSortBy } from 'src/entity/common/Enums';
import { Feed } from 'src/entity/feed.entity';
import { Follow } from 'src/entity/follow.entity';
import { Member } from 'src/entity/member.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class FeedQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

  async getFeedList(
    paginationRequest: PaginationRequest,
    memberId: number,
    sortBy: ListSortBy,
    generation?: number,
  ): Promise<GetFeedTuple[]> {
    const feedList = await this.getFeedListBaseQuery(memberId, sortBy, generation)
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

  async getFeedListCount(
    memberId: number,
    sortBy: ListSortBy,
    generation?: number,
  ): Promise<number> {
    return await this.getFeedListBaseQuery(memberId, sortBy, generation).getCount();
  }

  async getFeedDetail(feedId: number, memberId: number): Promise<GetFeedTuple> {
    const feed = await this.getFeedBaseQuery()
      .andWhere('feed.id = :feedId', { feedId })
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
        'CASE WHEN feed.member_id = :memberId THEN 1 ELSE 0 END as isMine',
      ])
      .setParameters({ memberId })
      .getRawOne();

    return plainToInstance(GetFeedTuple, feed);
  }

  private getFeedListBaseQuery(
    memberId: number,
    sortBy: ListSortBy,
    generation?: number
  ) {
    let query = this.getFeedBaseQuery()

    if (sortBy === ListSortBy.BY_FOLLOW) {
      query = query
        .innerJoin(Follow, 'follow', 'follower_member_id=member.id')
        .andWhere('following_member_id = :memberId', { memberId });
    }
    else if (sortBy === ListSortBy.BY_GENERATION) {
      query = query.andWhere('member.generation = :generation', { generation });
    }
    return query;
  }

  private getFeedBaseQuery() {
    return this.dataSource
      .createQueryBuilder()
      .from(Feed, 'feed')
      .innerJoin(Member, 'member', 'feed.memberId = member.id')
      .where('feed.deletedAt IS NULL')
      .andWhere('member.deletedAt IS NULL');
  }


  async getIsNotDeletedFeed(feedId: number): Promise<Feed | undefined> {
    const feed = this.dataSource
      .createQueryBuilder()
      .from(Feed, 'feed')
      .where('feed.id = :feedId', { feedId })
      .andWhere('feed.deletedAt IS NULL')
      .select('feed')
      .getOne();

    return plainToInstance(Feed, feed);
  }
}

export class GetFeedTuple {
  writerId: number;
  writerNickname: string;
  writerGeneration: number;
  writerProfileImageUrl: string;
  feedId: number;
  feedContent: string;
  feedViewCount: number;
  feedCommentCount: number;
  feedEmojiCount: number;
  feedCreatedAt: Date;
  @Transform(({ value }) => value === '1')
  isMine: boolean;
}