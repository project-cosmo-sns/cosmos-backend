import { Injectable } from '@nestjs/common';
import { GetSearchPostByHashTagRequestDto } from 'src/dto/request/get-search-post-by-hash-tag.request.dto';
import { GetSearchPostByHashTagResponseDto } from 'src/dto/response/get-search-post-by-hash-tag.response.dto';
import { SearchQueryRepository } from 'src/repository/search.query-repository';

@Injectable()
export class SearchService {
  constructor(private readonly searchQueryRepository: SearchQueryRepository) {}

  async searchPostByHashTag(
    requestDto: GetSearchPostByHashTagRequestDto,
  ): Promise<{ postList: GetSearchPostByHashTagResponseDto[]; totalCount: number }> {
    const postListTuple = await this.searchQueryRepository.searchPostByHashTag(requestDto);
    const totalCount = await this.searchQueryRepository.searchPostByHashTagTotalCount(requestDto.keyword);

    const postList = postListTuple.map((item) => {
      const writer = {
        id: item.writerId,
        nickname: item.writerNickname,
        generation: item.writerGeneration,
        profileImageUrl: item.writerProfileImageUrl,
      };

      const post = {
        id: item.postId,
        title: item.postTitle,
        content: item.postContent,
        viewCount: item.postViewCount,
        commentCount: item.postCommentCount,
        emojiCount: item.postEmojiCount,
        createdAt: item.postCreatedAt,
      };

      return GetSearchPostByHashTagResponseDto.from({ writer, post });
    });

    return { postList, totalCount };
  }
}
