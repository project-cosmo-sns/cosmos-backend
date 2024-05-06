import { FeedCommentQueryRepository } from './../repository/feed-comment.query-repository';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { FeedDomainService } from 'src/domain-service/feed.domain-service';
import { GetFeedCommentResponseDto } from 'src/dto/response/get-feed-comment.response.dto';
import { NotificationType } from 'src/entity/common/Enums';
import { Feed } from 'src/entity/feed.entity';
import { FeedComment } from 'src/entity/feed_comment.entity';
import { FeedCommentHeart } from 'src/entity/feed_comment_heart';
import { Notification } from 'src/entity/notification.entity';
import { FeedQueryRepository } from 'src/repository/feed.query-repository';
import { MemberQueryRepository } from 'src/repository/member.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class FeedCommentService {
  constructor(
    @InjectRepository(Feed) private readonly feedRepository: Repository<Feed>,
    @InjectRepository(FeedComment) private readonly feedCommentRepository: Repository<FeedComment>,
    @InjectRepository(FeedCommentHeart) private readonly feedCommentHeartRepository: Repository<FeedCommentHeart>,
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    private readonly feedDomainService: FeedDomainService,
    private readonly feedQueryRepository: FeedQueryRepository,
    private readonly feedCommentQueryRepository: FeedCommentQueryRepository,
    private readonly memberQueryRepository: MemberQueryRepository,
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
    const comment = await this.feedCommentRepository.save({
      feedId,
      memberId,
      content,
    });

    this.newFeedCommentNotification(feed.memberId, memberId, feedId, comment.id);
  }

  async patchFeedComment(feedId: number, commentId: number, memberId: number, content: string): Promise<void> {
    await this.feedDomainService.getFeedIsNotDeleted(feedId);

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
    const feed = await this.feedDomainService.getFeedIsNotDeleted(feedId);

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

  async likeFeedComment(feedId: number, commentId: number, memberId: number): Promise<void> {
    await this.feedDomainService.getFeedIsNotDeleted(feedId);

    const comment = await this.feedCommentQueryRepository.getIsNotDeletedFeedComment(commentId);

    if (!comment) {
      throw new NotFoundException('해당 댓글을 찾을 수 없습니다.');
    }

    comment.plusCommentHeartCount(comment.heartCount);
    await this.feedCommentRepository.save(comment);
    await this.feedCommentHeartRepository.save({ commentId, memberId });
  }

  async unlikeFeedComment(feedId: number, commentId: number, memberId: number) {
    await this.feedDomainService.getFeedIsNotDeleted(feedId);

    const comment = await this.feedCommentQueryRepository.getIsNotDeletedFeedComment(commentId);

    if (!comment) {
      throw new NotFoundException('해당 댓글을 찾을 수 없습니다.');
    }

    const commentHeart = await this.feedCommentHeartRepository.findOneBy({ commentId, memberId });

    if (!commentHeart) {
      throw new NotFoundException('해당 댓글 좋아요를 찾을 수 없습니다.');
    }

    comment.minusCommentHeartCount(comment.heartCount);
    await this.feedCommentRepository.save(comment);
    await this.feedCommentHeartRepository.remove(commentHeart);
  }

  private async newFeedCommentNotification(receivedMemberId, sendMemberId, feedId, commentId) {
    if (receivedMemberId === sendMemberId) {
      return;
    }

    try {
      const sendMember = await this.memberQueryRepository.getMemberIsNotDeletedById(sendMemberId);

      if (!sendMember) {
        throw new NotFoundException('해당 회원을 찾을 수 없습니다.');
      }

      const notification = new Notification();

      notification.memberId = receivedMemberId;
      notification.sendMemberId = sendMemberId;
      notification.notificationType = JSON.stringify({
        type: NotificationType.CREATE_FEED_COMMENT,
        feedId,
        commentId,
      });
      notification.content = `${sendMember.nickname}님이 회원님의 피드에 댓글을 남겼습니다.`;

      await this.notificationRepository.save(notification);
    } catch (e) {
      console.error(e);
    }
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
