import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { GetSearchMemberByNameRequestDto } from 'src/dto/request/get-search-member-by-name.request.dto';
import { GetSearchPostByHashTagRequestDto } from 'src/dto/request/get-search-post-by-hash-tag.request.dto';
import { HashTag } from 'src/entity/hash_tag.entity';
import { Member } from 'src/entity/member.entity';
import { Post } from 'src/entity/post.entity';
import { PostHashTag } from 'src/entity/post_hash_tag.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SearchQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async searchPostByHashTag(requestDto: GetSearchPostByHashTagRequestDto): Promise<GetSearchPostByHashTagTuple[]> {
    const postList = await this.searchPostByHashTagBaseQuery(requestDto.keyword)
      .select([
        'member.id as writerId',
        'member.nickname as writerNickname',
        'member.generation as writerGeneration',
        'member.profileImageUrl as writerProfileImageUrl',
        'post.id as postId',
        'post.title as postTitle',
        'post.content as postContent',
        'post.viewCount as postViewCount',
        'post.commentCount as postCommentCount',
        'post.emojiCount as postEmojiCount',
        'post.createdAt as postCreatedAt',
      ])
      .limit(requestDto.take)
      .offset(requestDto.getSkip())
      .orderBy('post.created_at', requestDto.order)
      .getRawMany();

    return plainToInstance(GetSearchPostByHashTagTuple, postList);
  }

  async searchPostByHashTagTotalCount(keyword: string) {
    return await this.searchPostByHashTagBaseQuery(keyword).getCount();
  }

  private searchPostByHashTagBaseQuery(keyword: string) {
    return this.dataSource
      .createQueryBuilder()
      .from(HashTag, 'hashTag')
      .innerJoin(PostHashTag, 'postHashTag', 'postHashTag.hashTagId = hashTag.id')
      .innerJoin(Post, 'post', 'post.id = postHashTag.postId')
      .innerJoin(Member, 'member', 'member.id = post.memberId')
      .where('hashTag.tagName LIKE :keyword', { keyword: `%${keyword}%` });
  }

  async searchMemberByName(
    requestDto: GetSearchMemberByNameRequestDto,
    memberId: number,
  ): Promise<GetSearchMemberByNameTuple[]> {
    const memberList = await this.searchMemberByNameBaseQuery(requestDto.keyword, memberId)
      .select([
        'member.id as id',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
        'member.introduce as introduce',
        'CASE WHEN follow.follower_member_id IS NOT NULL THEN true ELSE false END as isFollowing',
      ])
      .limit(requestDto.take)
      .offset(requestDto.getSkip())
      .orderBy('member.nickname')
      .getRawMany();

    return plainToInstance(GetSearchMemberByNameTuple, memberList);
  }

  async searchMemberByNameTotalCount(keyword: string, memberId: number) {
    return await this.searchMemberByNameBaseQuery(keyword, memberId).getCount();
  }

  private searchMemberByNameBaseQuery(keyword: string, memberId: number) {
    return this.dataSource
      .createQueryBuilder()
      .from(Member, 'member')
      .leftJoin(
        'follow',
        'follow',
        'follow.following_member_id = :memberId AND follow.follower_member_id = member.id',
        { memberId },
      )
      .where('member.nickname LIKE :keyword', { keyword: `%${keyword}%` });
  }
}

export class GetSearchPostByHashTagTuple {
  writerId: number;
  writerNickname: string;
  writerGeneration: number;
  writerProfileImageUrl: string;
  postId: number;
  postTitle: string;
  postContent: string;
  postViewCount: number;
  postCommentCount: number;
  postEmojiCount: number;
  postCreatedAt: string;
}

export class GetSearchMemberByNameTuple {
  id: number;
  nickname: string;
  generation: number;
  profileImageUrl: string;
  introduce: string;
  isFollowing: boolean;
}
