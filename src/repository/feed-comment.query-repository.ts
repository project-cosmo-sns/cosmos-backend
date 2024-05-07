import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Transform, plainToInstance } from 'class-transformer';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { FeedComment } from 'src/entity/feed_comment.entity';
import { FeedCommentHeart } from 'src/entity/feed_comment_heart';
import { Member } from 'src/entity/member.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class FeedCommentQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getFeedCommentList(
    feedId: number,
    memberId: number,
    paginationRequest: PaginationRequest,
  ): Promise<GetFeedCommentTuple[]> {
    const commentList = await this.getFeedCommentBaseQuery(feedId)
      .leftJoin(
        FeedCommentHeart,
        'feedCommentHeart',
        'feedComment.id = feedCommentHeart.commentId AND feedCommentHeart.memberId = :memberId',
      )
      .select([
        'member.id as writerId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profileImageUrl as profileImageUrl',
        'feedComment.id as commentId',
        'feedComment.content as content',
        'feedComment.heartCount as heartCount',
        'CASE WHEN ISNULL(feedCommentHeart.id) THEN false ELSE true END as isHearted',
        'feedComment.createdAt as createdAt',
        'CASE WHEN feedComment.member_id = :memberId THEN 1 ELSE 0 END as isMine',
      ])
      .limit(paginationRequest.take)
      .offset(paginationRequest.getSkip())
      .orderBy('feedComment.createdAt', paginationRequest.order)
      .setParameters({ memberId })
      .getRawMany();

    return plainToInstance(GetFeedCommentTuple, commentList);
  }

  async getFeedCommentListCount(feedId: number): Promise<number> {
    return await this.getFeedCommentBaseQuery(feedId).getCount();
  }

  private getFeedCommentBaseQuery(feedId: number) {
    return this.dataSource
      .createQueryBuilder()
      .from(FeedComment, 'feedComment')
      .innerJoin(Member, 'member', 'feedComment.memberId = member.id')
      .where('feedComment.deletedAt IS NULL')
      .andWhere('member.deletedAt IS NULL')
      .andWhere('feedComment.feed_id = :feedId', { feedId });
  }

  async getIsNotDeletedFeedComment(feedCommentId: number): Promise<FeedComment | undefined> {
    const feedComment = this.dataSource
      .createQueryBuilder()
      .from(FeedComment, 'feedComment')
      .where('feedComment.id = :feedCommentId', { feedCommentId })
      .andWhere('feedComment.deletedAt IS NULL')
      .select('feedComment')
      .getOne();

    return plainToInstance(FeedComment, feedComment);
  }
}

export class GetFeedCommentTuple {
  writerId: number;
  nickname: string;
  generation: number;
  profileImageUrl: string;
  commentId: number;
  content: string;
  heartCount: number;
  @Transform(({ value }) => Boolean(value))
  isHearted: boolean;
  createdAt: Date;
  @Transform(({ value }) => Boolean(value))
  isMine: boolean;
}
