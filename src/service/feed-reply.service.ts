import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedDomainService } from 'src/domain-service/feed.domain-service';
import { FeedComment } from 'src/entity/feed_comment.entity';
import { FeedReply } from 'src/entity/feed_reply.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FeedReplyService {
  constructor(
    private readonly feedDomainService: FeedDomainService,
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
    if (!replyInfo) {
      throw new NotFoundException('해당 답글을 찾을 수 없습니다.');
    }
    if (replyInfo.memberId !== memberId) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    replyInfo.setFeedReplyContent(content);
    await this.feedReplyRepository.save(replyInfo);
  }
}