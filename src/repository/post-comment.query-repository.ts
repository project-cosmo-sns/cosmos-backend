import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Transform, plainToInstance } from 'class-transformer';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { Member } from 'src/entity/member.entity';
import { PostComment } from 'src/entity/post_comment.entity';
import { PostCommentHeart } from 'src/entity/post_comment_heart.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PostCommentQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

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
      ])
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
}
