import { Injectable } from '@nestjs/common';
import { GetSearchMemberByNameRequestDto } from 'src/dto/request/get-search-member-by-name.request.dto';
import { GetSearchPostByHashTagRequestDto } from 'src/dto/request/get-search-post-by-hash-tag.request.dto';
import { GetSearchMemberByNameResponseDto } from 'src/dto/response/get-search-member-by-name.response.dto';
import { GetSearchPostByHashTagResponseDto } from 'src/dto/response/get-search-post-by-hash-tag.response.dto';
import { FollowQueryRepository } from 'src/repository/follow.query-repository';
import { SearchQueryRepository } from 'src/repository/search.query-repository';

@Injectable()
export class SearchService {
  constructor(
    private readonly searchQueryRepository: SearchQueryRepository,
    private readonly followQueryRepository: FollowQueryRepository,
  ) { }

  async searchPostByHashTag(
    requestDto: GetSearchPostByHashTagRequestDto,
    memberId: number,
  ): Promise<{ postList: GetSearchPostByHashTagResponseDto[]; totalCount: number }> {
    const postListTuple = await this.searchQueryRepository.searchPostByHashTag(requestDto);
    const totalCount = await this.searchQueryRepository.searchPostByHashTagTotalCount(requestDto.keyword);

    const postList = await Promise.all(postListTuple.map(async (item) => {
      const writer = {
        id: item.writerId,
        nickname: item.writerNickname,
        generation: item.writerGeneration,
        profileImageUrl: item.writerProfileImageUrl,
      };

      const hashTagInfo = await this.searchQueryRepository.getSearchedPostHashTag(item.postId);
      const postListEmojiInfo = await this.searchQueryRepository.getSearchPostEmoji(item.postId, memberId);
      const post = {
        id: item.postId,
        title: item.postTitle,
        content: item.postContent,
        viewCount: item.postViewCount,
        commentCount: item.postCommentCount,
        emojiCount: item.postEmojiCount,
        createdAt: item.postCreatedAt,
        hashTags: hashTagInfo,
        emojis: postListEmojiInfo,
      };

      return GetSearchPostByHashTagResponseDto.from({ writer, post });
    }),
    );
    return { postList, totalCount };
  }

  async searchUserByName(
    requestDto: GetSearchMemberByNameRequestDto,
    memberId: number,
  ): Promise<{ memberList: GetSearchMemberByNameResponseDto[]; totalCount: number }> {
    const memberListTuple = await this.searchQueryRepository.searchMemberByName(requestDto, memberId);
    const totalCount = await this.searchQueryRepository.searchMemberByNameTotalCount(requestDto.keyword, memberId);

    const memberList = await Promise.all(
      memberListTuple.map(async (item) => {
        const followerCount = await this.followQueryRepository.getFollowerCountByMemberId(item.id);
        const followingCount = await this.followQueryRepository.getProfileFollowingCountByMemberId(item.id);

        const member = {
          id: item.id,
          nickname: item.nickname,
          generation: item.generation,
          profileImageUrl: item.profileImageUrl,
          introduce: item.introduce,
          followerCount,
          followingCount,
          isFollowing: item.isFollowing,
          isMine: item.id === memberId,
        };

        return GetSearchMemberByNameResponseDto.from({ member });
      }),
    );

    return { memberList, totalCount };
  }
}
