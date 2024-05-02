import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Transform, plainToInstance } from 'class-transformer';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { HashTagSearchRequest } from 'src/dto/request/hash-tag-search.request';
import { ListSortBy } from 'src/entity/common/Enums';
import { Follow } from 'src/entity/follow.entity';
import { HashTag } from 'src/entity/hash_tag.entity';
import { Member } from 'src/entity/member.entity';
import { Post } from 'src/entity/post.entity';
import { PostComment } from 'src/entity/post_comment.entity';
import { PostCommentHeart } from 'src/entity/post_comment_heart.entity';
import { PostHashTag } from 'src/entity/post_hash_tag.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PostQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

  async getPostList(
    memberId: number,
    paginationRequest: PaginationRequest,
    sortPostList: ListSortBy,
    generation?: number,

  ): Promise<GetPostListTuple[]> {
    let query = this.getPostListBaseQuery(
      memberId,
      paginationRequest,
      sortPostList,
      generation,
    )
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

    const postList = await query.getRawMany();
    return plainToInstance(GetPostListTuple, postList);

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
    let query = this.dataSource.createQueryBuilder()
      .from(Post, 'post')
      .innerJoin(Member, 'member', 'post.member_id = member.id')
      .where('post.deleted_at IS NULL')
      .andWhere('member.deleted_at IS NULL');


    if (sortPostList === ListSortBy.BY_FOLLOW) {
      query = query.innerJoin(Follow, 'follow', 'following_member_id = member.id')
        .andWhere('follower_member_id = :memberId', { memberId });
    }

    else if (sortPostList === ListSortBy.BY_GENERATION) {
      query = query.andWhere('member.generation = :generation', { generation });
    }

    return query;
  }

  async getPostDetail(postId: number): Promise<GetPostDetailTuple> {
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
        'post.title as title',
        'post.content as content',
        'post.emoji_count as emojiCount',
        'post.comment_count as commentCount',
        'post.view_count as viewCount',
        'member.deleted_at as memberDeletedAt'
      ])
      .getRawOne()
    return plainToInstance(GetPostDetailTuple, postDetail);
  }

  async getPostDetailHashTag(postId: number): Promise<GetPostDetailHashTagTuple[]> {
    const postDetailHashTag = await this.dataSource
      .createQueryBuilder()
      .from(HashTag, 'hash_tag')
      .innerJoin(PostHashTag, 'post_hash_tag', 'post_hash_tag.hash_tag_id = hash_tag.id')
      .where('post_hash_tag.post_id = :postId', { postId })
      .select([
        'hash_tag.tagName as tagName',
        'hash_tag.color as color'
      ])
      .getRawMany()
    return plainToInstance(GetPostDetailHashTagTuple, postDetailHashTag);
  }


  async getPostCommentList(
    postId: number,
    memberId: number,
    paginationRequest: PaginationRequest,
  ): Promise<GetPostCommentTuple[]> {
    const postCommentList = await this.getPostCommentListBaseQuery(postId)
      .leftJoin(
        PostCommentHeart,
        'post_comment_heart',
        'post_comment_heart.comment_id = post_comment.id AND post_comment_heart.member_id = :memberId', { memberId }
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
      ])
      .limit(paginationRequest.take)
      .offset(paginationRequest.getSkip())
      .orderBy('post_comment.createdAt', paginationRequest.order)
      .getRawMany()

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

  async getHashTagSearchList(search: HashTagSearchRequest): Promise<GetHashTagSearchTuple[]> {
    const searchResult = await this.dataSource
      .createQueryBuilder()
      .from(HashTag, 'hash_Tag')
      .select(['tag_name as tagName'])
      .where(`tag_name LIKE '%${search.searchWord}%'`)
      .limit(10)
      .getRawMany()

    return plainToInstance(GetHashTagSearchTuple, searchResult);
  }
}

export class GetPostListTuple {
  memberId!: number;
  nickname!: string;
  generation!: number;
  profileImageUrl!: string;
  createdAt!: Date;
  postId!: number;
  title!: string;
  content!: string;
  emojiCount!: number;
  commentCount!: number;
  viewCount!: number;
}

export class GetPostDetailTuple {
  memberId!: number;
  nickname!: string;
  generation!: number;
  profileImageUrl!: string;
  createdAt!: Date;
  postId!: number;
  title!: string;
  content!: string;
  emojiCount!: number;
  commentCount!: number;
  viewCount!: number;
  memberDeletedAt!: Date;
}

export class GetPostDetailHashTagTuple {
  tagName: string;
  color: string;
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
}

export class GetHashTagSearchTuple {
  tagName!: string;
}