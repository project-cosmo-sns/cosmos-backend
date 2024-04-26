import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { ListSortBy } from 'src/entity/common/Enums';
import { Follow } from 'src/entity/follow.entity';
import { HashTag } from 'src/entity/hash_tag.entity';
import { Member } from 'src/entity/member.entity';
import { Post } from 'src/entity/post.entity';
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