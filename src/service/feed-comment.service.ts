import { FeedCommentQueryRepository } from './../repository/feed-comment.query-repository';
import { GoneException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { GetFeedCommentResponseDto } from 'src/dto/response/get-feed-comment.response.dto';
import { Feed } from 'src/entity/feed.entity';
import { FeedComment } from 'src/entity/feed_comment.entity';
import { FeedQueryRepository } from 'src/repository/feed.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class FeedCommentService {
  constructor(
    @InjectRepository(Feed) private readonly feedRepository: Repository<Feed>,
    @InjectRepository(FeedComment) private readonly feedCommentRepository: Repository<FeedComment>,
    private readonly feedQueryRepository: FeedQueryRepository,
    private readonly feedCommentQueryRepository: FeedCommentQueryRepository,
  ) {}

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

  async postFeedComment(feedId: number, memberId: number, content: string): Promise<void> {
    const feed = await this.feedQueryRepository.getIsNotDeletedFeed(feedId);

    if (!feed) {
      throw new NotFoundException('해당 피드를 찾을 수 없습니다.');
    }

    feed.plusCommentCount(feed.commentCount);

    await this.feedRepository.save(feed);
    await this.feedCommentRepository.save({
      feedId,
      memberId,
      content,
    });
  }

  async patchFeedComment(feedId: number, commentId: number, memberId: number, content: string): Promise<void> {
    const feed = await this.feedQueryRepository.getIsNotDeletedFeed(feedId);

    if (!feed) {
      throw new NotFoundException('해당 피드를 찾을 수 없습니다.');
    }

    const comment = await this.feedCommentQueryRepository.getIsNotDeletedFeedComment(commentId);

    if (!comment) {
      throw new NotFoundException('해당 댓글을 찾을 수 없습니다.');
    }

    if (comment.memberId !== memberId) {
      throw new UnauthorizedException('접근 권한이 없습니다.');
    }

    comment.setCommentContent(content);
    await this.feedCommentRepository.save(comment);
  }

  async deleteFeedComment(feedId: number, commentId: number, memberId: number): Promise<void> {
    const feed = await this.feedQueryRepository.getIsNotDeletedFeed(feedId);

    if (!feed) {
      throw new NotFoundException('해당 피드를 찾을 수 없습니다.');
    }

    const comment = await this.feedCommentQueryRepository.getIsNotDeletedFeedComment(commentId);

    if (!comment) {
      throw new NotFoundException('해당 댓글을 찾을 수 없습니다.');
    }

    if (comment.memberId !== memberId) {
      throw new UnauthorizedException('접근 권한이 없습니다.');
    }

    feed.minusCommentCount(feed.commentCount);
    await this.feedRepository.save(feed);

    comment.deleteComment(new Date());
    await this.feedCommentRepository.save(comment);
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
