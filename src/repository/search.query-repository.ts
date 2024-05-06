import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Transform, plainToInstance } from 'class-transformer';
import { GetSearchMemberByNameRequestDto } from 'src/dto/request/get-search-member-by-name.request.dto';
import { GetSearchPostByHashTagRequestDto } from 'src/dto/request/get-search-post-by-hash-tag.request.dto';
import { EmojiType } from 'src/entity/common/Enums';
import { HashTag } from 'src/entity/hash_tag.entity';
import { Member } from 'src/entity/member.entity';
import { Post } from 'src/entity/post.entity';
import { PostEmoji } from 'src/entity/post_emoji.entity';
import { PostHashTag } from 'src/entity/post_hash_tag.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SearchQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

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
      .where('hashTag.tagName LIKE :keyword', { keyword: `%${keyword}%` })
      .andWhere('post.deletedAt IS NULL')
      .andWhere('member.deletedAt IS NULL');
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

  async getSearchedPostHashTag(postId: number): Promise<GetSearchedPostHashTagTuple[]> {
    const searchedPostHashTag = await this.dataSource
      .createQueryBuilder()
      .from(HashTag, 'hash_tag')
      .innerJoin(PostHashTag, 'post_hash_tag', 'post_hash_tag.hash_tag_id = hash_tag.id')
      .where('post_hash_tag.post_id = :postId', { postId })
      .select(['hash_tag.tagName as tagName', 'hash_tag.color as color'])
      .getRawMany();
    return plainToInstance(GetSearchedPostHashTagTuple, searchedPostHashTag);
  }

  async getSearchPostEmoji(postId: number, memberId: number): Promise<GetSearchedPostEmojiTuple[]> {
    const emojiListInfo = await this.dataSource
      .createQueryBuilder()
      .from(PostEmoji, 'post_emoji')
      .select('post_emoji.emoji as emojiCode')
      .addSelect('COUNT(*) as emojiCount')
      .addSelect(
        'CASE WHEN SUM(CASE WHEN post_emoji.member_id = :memberId THEN 1 ELSE 0 END) > 0 THEN true ELSE false END as isClicked',
      )
      .where('post_emoji.post_id = :postId')
      .groupBy('post_emoji.emoji')
      .setParameters({ memberId, postId })
      .getRawMany();

    return plainToInstance(GetSearchedPostEmojiTuple, emojiListInfo);
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


export class GetSearchedPostHashTagTuple {
  tagName: string;
  color: string;
}

export class GetSearchedPostEmojiTuple {
  emojiCode!: EmojiType;
  emojiCount!: number;
  @Transform(({ value }) => value === '1')
  isClicked!: boolean;
}