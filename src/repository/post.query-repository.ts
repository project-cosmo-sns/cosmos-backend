import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Transform, plainToInstance } from 'class-transformer';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { ListSortBy } from 'src/entity/common/Enums';
import { Follow } from 'src/entity/follow.entity';
import { Member } from 'src/entity/member.entity';
import { Post } from 'src/entity/post.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PostQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

  async getPostList(
    memberId: number,
    paginationRequest: PaginationRequest,
    sortPostList: ListSortBy,
    generation?: number,
  ): Promise<GetPostTuple[]> {
    let query = this.getPostListBaseQuery(memberId, paginationRequest, sortPostList, generation)
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
        'post.id as postId',
        'post.category as category',
        'post.title as title',
        'post.content as content',
        'post.emoji_count as emojiCount',
        'post.comment_count as commentCount',
        'post.view_count as viewCount',
        'post.created_at as createdAt',
      ])
      .limit(paginationRequest.take)
      .offset(paginationRequest.getSkip())
      .orderBy('post.created_at', paginationRequest.order);

    const postList = await query.getRawMany();
    return plainToInstance(GetPostTuple, postList);
  }

  async getAllPostListTotalCount(
    memberId: number,
    paginationRequest: PaginationRequest,
    sortPostList: ListSortBy,
    generation?: number,
  ) {
    return await this.getPostListBaseQuery(memberId, paginationRequest, sortPostList, generation).getCount();
  }

  private getPostListBaseQuery(
    memberId: number,
    paginationRequest: PaginationRequest,
    sortPostList: ListSortBy,
    generation?: number,
  ) {
    let query = this.dataSource
      .createQueryBuilder()
      .from(Post, 'post')
      .innerJoin(Member, 'member', 'post.member_id = member.id')
      .where('post.deleted_at IS NULL')
      .andWhere('member.deleted_at IS NULL');

    if (sortPostList === ListSortBy.BY_FOLLOW) {
      query = query
        .innerJoin(Follow, 'follow', 'follower_member_id = member.id')
        .andWhere('following_member_id = :memberId', { memberId });
    } else if (sortPostList === ListSortBy.BY_GENERATION) {
      query = query.andWhere('member.generation = :generation', { generation });
    }

    return query;
  }

  async getPostDetail(postId: number, memberId: number): Promise<GetPostDetailTuple> {
    const postDetail = await this.dataSource
      .createQueryBuilder()
      .from(Post, 'post')
      .innerJoin(Member, 'member', 'post.member_id = member.id')
      .where('post.id = :postId', { postId })
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
        'post.id as postId',
        'post.category as category',
        'post.title as title',
        'post.content as content',
        'post.emoji_count as emojiCount',
        'post.comment_count as commentCount',
        'post.view_count as viewCount',
        'member.deleted_at as memberDeletedAt',
        'post.created_at as createdAt',
        'CASE WHEN post.member_id = :memberId THEN 1 ELSE 0 END as isMine',
      ])
      .setParameters({ memberId })
      .getRawOne();
    return plainToInstance(GetPostDetailTuple, postDetail);
  }

  async getIsNotDeletedPost(postId: number): Promise<Post | undefined> {
    const post = this.dataSource
      .createQueryBuilder()
      .from(Post, 'post')
      .where('post.id = :postId', { postId })
      .andWhere('post.deletedAt IS NULL')
      .select('post')
      .getOne();

    return plainToInstance(Post, post);
  }
}

export class GetPostTuple {
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
}

export class GetPostDetailTuple extends GetPostTuple {
  memberDeletedAt!: Date;
  @Transform(({ value }) => value === '1')
  isMine: boolean;
}
