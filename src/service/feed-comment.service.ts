import { FeedCommentQueryRepository } from './../repository/feed-comment.query-repository';
import { Injectable } from '@nestjs/common';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { GetFeedCommentResponseDto } from 'src/dto/response/get-feed-comment.response.dto';

@Injectable()
export class FeedCommentService {
  constructor(private readonly feedCommentQueryRepository: FeedCommentQueryRepository) {}

  async getFeedCommentList(
    feedId: number,
    memberId: number,
    paginationRequest: PaginationRequest,
  ): Promise<{ commentList: GetFeedCommentResponseDto[]; totalCount: number }> {
    const commentListTuple = await this.feedCommentQueryRepository.getFeedCommentList(
      feedId,
      memberId,
      paginationRequest,
    );

    const totalCount = await this.feedCommentQueryRepository.getFeedCommentListCount(feedId);

    const commentList = commentListTuple.map((item) => {
      const writer = {
        id: item.writerId,
        nickname: item.nickname,
        generation: item.generation,
        profileImageUrl: item.profileImageUrl,
      };

      const comment = {
        id: item.commentId,
        content: item.content,
        heartCount: item.heartCount,
        isHearted: item.isHearted,
        createdAt: item.createdAt,
      };

      return GetFeedCommentResponseDto.from({ writer, comment });
    });

    return { commentList, totalCount };
  }
}

export class FeedCommentWriterDto {
  id: number;
  nickname: string;
  generation: number;
  profileImageUrl: string;
}

export class FeedCommentDto {
  id: number;
  content: string;
  heartCount: number;
  isHearted: boolean;
  createdAt: Date;
}
