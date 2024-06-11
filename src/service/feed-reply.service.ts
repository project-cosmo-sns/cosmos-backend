import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { FeedDomainService } from 'src/domain-service/feed.domain-service';
import { GetFeedReplyList } from 'src/dto/get-feed-reply-list.dto';
import { FeedComment } from 'src/entity/feed_comment.entity';
import { FeedReply } from 'src/entity/feed_reply.entity';
import { FeedCommentQueryRepository } from 'src/repository/feed-comment.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class FeedReplyService {
  constructor(
    private readonly feedDomainService: FeedDomainService,
    private readonly feedCommentQueryRepository: FeedCommentQueryRepository,
    @InjectRepository(FeedComment) private readonly feedCommentRepository: Repository<FeedComment>,
    @InjectRepository(FeedReply) private readonly feedReplyRepository: Repository<FeedReply>,
  ) { }

  async writeFeedReply(feedId: number, commentId: number, memberId: number, content: string): Promise<void> {
    await this.feedDomainService.getFeedIsNotDeleted(feedId);

    const commentInfo = await this.feedCommentRepository.findOneBy({ feedId, id: commentId });
    if (!commentInfo) {
      throw new NotFoundException('답글을 생성할 댓글을 찾을 수 없습니다.');
    }
    const reply = await this.feedReplyRepository.save({
      feedId,
      commentId,
      memberId,
      content,
    });

  }

  async patchFeedReply(feedId: number, replyId: number, memberId: number, content: string): Promise<void> {
    await this.feedDomainService.getFeedIsNotDeleted(feedId);
    const replyInfo = await this.feedReplyRepository.findOneBy({ id: replyId, feedId });
    if (!replyInfo || replyInfo.deletedAt !== null) {
      throw new NotFoundException('해당 답글을 찾을 수 없습니다.');
    }
    if (replyInfo.memberId !== memberId) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    replyInfo.setFeedReplyContent(content);
    await this.feedReplyRepository.save(replyInfo);
  }

  async deleteFeedReply(feedId: number, replyId: number, memberId: number): Promise<void> {
    await this.feedDomainService.getFeedIsNotDeleted(feedId);
    const replyInfo = await this.feedReplyRepository.findOneBy({ id: replyId, feedId });
    if (!replyInfo || replyInfo.deletedAt !== null) {
      throw new NotFoundException('해당 답글을 찾을 수 없습니다.');
    }

    if (replyInfo.memberId !== memberId) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    replyInfo.setFeedReplyDeleted(new Date());
    await this.feedReplyRepository.save(replyInfo);

  }

  async getFeedReplyList(commentId: number, memberId: number, paginationRequest: PaginationRequest) {
    const feedReplyList = await this.feedCommentQueryRepository.getFeedReplyList(commentId, memberId, paginationRequest);
    const totalCount = await this.feedCommentQueryRepository.getFeedReplyListCount(commentId);
    const feedReplyInfo = feedReplyList.map((replyList) => GetFeedReplyList.from(replyList));
    return { feedReplyInfo, totalCount };
  }
}

export class FeedReplyWriterDto {
  id: number;
  nickname: string;
  generation: number;
  profileImageUrl: string;
}

export class FeedReplyDto {
  id: number;
  content: string;
  heartCount: number;
  isHearted: boolean;
  createdAt: Date;
  isMine: boolean;
}