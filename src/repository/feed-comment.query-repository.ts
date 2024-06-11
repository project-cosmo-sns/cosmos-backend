import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Transform, plainToInstance } from 'class-transformer';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { FeedComment } from 'src/entity/feed_comment.entity';
import { FeedCommentHeart } from 'src/entity/feed_comment_heart';
import { FeedReply } from 'src/entity/feed_reply.entity';
import { FeedReplyHeart } from 'src/entity/feed_reply_heart.entity';
import { Member } from 'src/entity/member.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class FeedCommentQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

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
      .leftJoin(
        FeedReply,
        'feed_reply',
        'feed_reply.comment_id = feedComment.id'
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
        'CASE WHEN feed_reply.id IS NOT NULL THEN true ELSE false END as isReplied',
      ])
      .groupBy('feedComment.id')
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

  async getFeedReplyList(
    commentId: number,
    memberId: number,
    paginationRequest: PaginationRequest,
  ): Promise<GetFeedReplyTuple[]> {
    const feedReplyList = await this.getFeedReplyListBaseQuery(commentId)
      .leftJoin(
        FeedReplyHeart,
        'feed_reply_heart',
        'feed_reply_heart.reply_id = feed_reply.id AND feed_reply_heart.member_id = :memberId',
      )
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
        'feed_reply.id as replyId',
        'feed_reply.content as content',
        'feed_reply.heart_count as heartCount',
        'feed_reply.created_at as createdAt',
        'CASE WHEN feed_reply_heart.id IS NOT NULL THEN true ELSE false END as isHearted',
        'CASE WHEN feed_reply.member_id = :memberId THEN 1 ELSE 0 END as isMine',
      ])
      .limit(paginationRequest.take)
      .offset(paginationRequest.getSkip())
      .orderBy('feed_reply.createdAt', paginationRequest.order)
      .setParameters({ memberId })
      .getRawMany();

    return plainToInstance(GetFeedReplyTuple, feedReplyList);
  }

  async getFeedReplyListCount(commentId: number): Promise<number> {
    return await this.getFeedReplyListBaseQuery(commentId).getCount();
  }

  private getFeedReplyListBaseQuery(commentId: number) {
    return this.dataSource
      .createQueryBuilder()
      .from(FeedReply, 'feed_reply')
      .innerJoin(Member, 'member', 'feed_reply.member_id = member.id')
      .where('feed_reply.deletedAt IS NULL')
      .andWhere('member.deletedAt IS NULL')
      .andWhere('feed_reply.comment_id = :commentId', { commentId });
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
  @Transform(({ value }) => Boolean(value))
  isReplied: boolean;
}

export class GetFeedReplyTuple {
  memberId: number;
  nickname: string;
  generation: number;
  profileImageUrl: string;
  replyId: number;
  content: string;
  heartCount: number;
  createdAt: Date;
  @Transform(({ value }) => Boolean(value))
  isHearted: boolean;
  @Transform(({ value }) => Boolean(value))
  isMine: boolean;
}
