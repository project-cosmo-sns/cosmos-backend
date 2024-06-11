import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Transform, plainToInstance } from 'class-transformer';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { Member } from 'src/entity/member.entity';
import { PostComment } from 'src/entity/post_comment.entity';
import { PostCommentHeart } from 'src/entity/post_comment_heart.entity';
import { PostReply } from 'src/entity/post_reply.entity';
import { PostReplyHeart } from 'src/entity/post_reply_heart.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PostCommentQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

  async getPostCommentList(
    postId: number,
    memberId: number,
    paginationRequest: PaginationRequest,
  ): Promise<GetPostCommentTuple[]> {
    const postCommentList = await this.getPostCommentListBaseQuery(postId)
      .leftJoin(
        PostCommentHeart,
        'post_comment_heart',
        'post_comment_heart.comment_id = post_comment.id AND post_comment_heart.member_id = :memberId',
      )
      .leftJoin(
        PostReply,
        'post_reply',
        'post_reply.comment_id = post_comment.id'
      )
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
        'post_comment.id as commentId',
        'post_comment.content as content',
        'post_comment.heart_count as heartCount',
        'post_comment.created_at as createdAt',
        'CASE WHEN post_comment_heart.id IS NOT NULL THEN true ELSE false END as isHearted',
        'CASE WHEN post_comment.member_id = :memberId THEN 1 ELSE 0 END as isMine',
        'CASE WHEN post_reply.id IS NOT NULL THEN true ELSE false END as isReplied'
      ])
      .groupBy('post_comment.id')
      .limit(paginationRequest.take)
      .offset(paginationRequest.getSkip())
      .orderBy('post_comment.createdAt', paginationRequest.order)
      .setParameters({ memberId })
      .getRawMany();

    return plainToInstance(GetPostCommentTuple, postCommentList);
  }

  async getPostCommentListCount(postId: number): Promise<number> {
    return await this.getPostCommentListBaseQuery(postId).getCount();
  }

  private getPostCommentListBaseQuery(postId: number) {
    return this.dataSource
      .createQueryBuilder()
      .from(PostComment, 'post_comment')
      .innerJoin(Member, 'member', 'post_comment.member_id = member.id')
      .where('post_comment.deletedAt IS NULL')
      .andWhere('member.deletedAt IS NULL')
      .andWhere('post_comment.post_id = :postId', { postId });
  }

  async getPostReplyList(
    commentId: number,
    memberId: number,
    paginationRequest: PaginationRequest,
  ): Promise<GetPostReplyTuple[]> {
    const postReplyList = await this.getPostReplyListBaseQuery(commentId)
      .leftJoin(
        PostReplyHeart,
        'post_reply_heart',
        'post_reply_heart.reply_id = post_reply.id AND post_reply_heart.member_id = :memberId',
      )
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
        'post_reply.id as replyId',
        'post_reply.content as content',
        'post_reply.heart_count as heartCount',
        'post_reply.created_at as createdAt',
        'CASE WHEN post_reply_heart.id IS NOT NULL THEN true ELSE false END as isHearted',
        'CASE WHEN post_reply.member_id = :memberId THEN 1 ELSE 0 END as isMine',
      ])
      .limit(paginationRequest.take)
      .offset(paginationRequest.getSkip())
      .orderBy('post_reply.createdAt', paginationRequest.order)
      .setParameters({ memberId })
      .getRawMany();

    return plainToInstance(GetPostReplyTuple, postReplyList);
  }

  async getPostReplyListCount(commentId: number): Promise<number> {
    return await this.getPostReplyListBaseQuery(commentId).getCount();
  }

  private getPostReplyListBaseQuery(commentId: number) {
    return this.dataSource
      .createQueryBuilder()
      .from(PostReply, 'post_reply')
      .innerJoin(Member, 'member', 'post_reply.member_id = member.id')
      .where('post_reply.deletedAt IS NULL')
      .andWhere('member.deletedAt IS NULL')
      .andWhere('post_reply.comment_id = :commentId', { commentId });
  }
}

export class GetPostCommentTuple {
  memberId: number;
  nickname: string;
  generation: number;
  profileImageUrl: string;
  commentId: number;
  content: string;
  heartCount: number;
  createdAt: Date;
  @Transform(({ value }) => Boolean(value))
  isHearted: boolean;
  @Transform(({ value }) => Boolean(value))
  isMine: boolean;
  @Transform(({ value }) => Boolean(value))
  isReplied: boolean;
}

export class GetPostReplyTuple {
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
