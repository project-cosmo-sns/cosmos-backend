import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { Feed } from 'src/entity/feed.entity';
import { Member } from 'src/entity/member.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class FeedQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getFeedList(paginationRequest: PaginationRequest): Promise<GetFeedListTuple[]> {
    const feedList = await this.getFeedListBaseQuery()
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

    return plainToInstance(GetFeedListTuple, feedList);
  }

  async getFeedListCount(): Promise<number> {
    return await this.getFeedListBaseQuery().getCount();
  }

  private getFeedListBaseQuery() {
    return this.dataSource
      .createQueryBuilder()
      .from(Feed, 'feed')
      .innerJoin(Member, 'member', 'feed.memberId = member.id')
      .where('feed.deletedAt IS NULL')
      .andWhere('member.deletedAt IS NULL');
  }
}

export class GetFeedListTuple {
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
}
