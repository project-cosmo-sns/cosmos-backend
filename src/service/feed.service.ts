import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { FeedDomainService } from 'src/domain-service/feed.domain-service';
import { MemberDomainService } from 'src/domain-service/member.domain-service';
import { NotificationDomainService } from 'src/domain-service/notification.domain-service';
import { GetFeedDetailResponseDto } from 'src/dto/response/get-feed-detail.response.dto';
import { GetFeedResponseDto } from 'src/dto/response/get-feed.response.dto';
import { EmojiType, NotificationType } from 'src/entity/common/Enums';
import { Feed } from 'src/entity/feed.entity';
import { FeedEmoji } from 'src/entity/feed_emoji.entity';
import { FeedImage } from 'src/entity/feed_image.entity';
import { FeedEmojiQueryRepository } from 'src/repository/feed-emoji.query-repository';
import { FeedQueryRepository } from 'src/repository/feed.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Feed) private readonly feedRepository: Repository<Feed>,
    @InjectRepository(FeedImage) private readonly feedImageRepository: Repository<FeedImage>,
    @InjectRepository(FeedEmoji) private readonly feedEmojiRepository: Repository<FeedEmoji>,
    private readonly feedQueryRepository: FeedQueryRepository,
    private readonly feedEmojiQueryRepository: FeedEmojiQueryRepository,
    private readonly feedDomainService: FeedDomainService,
    private readonly memberDomainService: MemberDomainService,
    private readonly notificationDomainService: NotificationDomainService,
  ) {}

  async postFeed(memberId: number, content: string, imageUrls: string[]): Promise<void> {
    const feed = new Feed();

    feed.memberId = memberId;
    feed.content = content;

    await this.feedRepository.save(feed);

    await Promise.all(
      imageUrls.map(async (imageUrl) => {
        const feedImage = new FeedImage();
        feedImage.feedId = feed.id;
        feedImage.imageUrl = imageUrl;

        await this.feedImageRepository.save(feedImage);
      }),
    );
  }

  async patchFeed(memberId: number, feedId: number, content: string, imageUrls: string[]): Promise<void> {
    const feed = await this.feedDomainService.getFeedIsNotDeleted(feedId);

    if (feed.memberId !== memberId) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    feed.updateFeed(content);

    await this.feedRepository.save(feed);

    await Promise.all([
      await this.feedImageRepository.remove(await this.feedImageRepository.findBy({ feedId })),

      ...imageUrls.map(async (imageUrl) => {
        const feedImage = new FeedImage();
        feedImage.feedId = feed.id;
        feedImage.imageUrl = imageUrl;

        await this.feedImageRepository.save(feedImage);
      }),
    ]);
  }

  async getFeedList(
    paginationRequest: PaginationRequest,
    memberId: number,
  ): Promise<{ feedList: GetFeedResponseDto[]; totalCount: number }> {
    const getFeedListTuple = await this.feedQueryRepository.getFeedList(paginationRequest);
    const totalCount = await this.feedQueryRepository.getFeedListCount();

    const feedList = await Promise.all(
      getFeedListTuple.map(async (item) => {
        const writer = {
          id: item.writerId,
          nickname: item.writerNickname,
          generation: item.writerGeneration,
          profileImageUrl: item.writerProfileImageUrl,
        };

        const feedImages = await this.feedImageRepository.findBy({ feedId: item.feedId });
        const feedEmojis = await this.feedEmojiQueryRepository.getFeedEmoji(item.feedId, memberId);
        const feed = {
          id: item.feedId,
          content: item.feedContent,
          viewCount: item.feedViewCount,
          commentCount: item.feedCommentCount,
          emojiCount: item.feedEmojiCount,
          createdAt: item.feedCreatedAt,
          imageUrls: feedImages.map((feedImage) => feedImage.imageUrl),
          emojis: feedEmojis.map((emoji) => ({
            emojiCode: emoji.emojiCode,
            emojiCount: emoji.emojiCount,
            isClicked: emoji.isClicked,
          })),
        };

        return GetFeedResponseDto.from({ writer, feed });
      }),
    );

    return { feedList, totalCount };
  }

  async getFeedDetail(feedId: number, memberId: number): Promise<GetFeedDetailResponseDto> {
    const feed = await this.feedQueryRepository.getFeedDetail(feedId, memberId);

    if (!feed) {
      throw new NotFoundException('해당 피드를 찾을 수 없습니다.');
    }

    const feedImages = await this.feedImageRepository.findBy({ feedId });
    const feedEmojis = await this.feedEmojiQueryRepository.getFeedEmoji(feedId, memberId);
    return new GetFeedDetailResponseDto(
      {
        id: feed.writerId,
        nickname: feed.writerNickname,
        generation: feed.writerGeneration,
        profileImageUrl: feed.writerProfileImageUrl,
      },
      {
        id: feed.feedId,
        content: feed.feedContent,
        viewCount: feed.feedViewCount,
        commentCount: feed.feedCommentCount,
        emojiCount: feed.feedEmojiCount,
        createdAt: feed.feedCreatedAt,
        imageUrls: feedImages.map((feedImage) => feedImage.imageUrl),
        isMine: feed.isMine,
        emojis: feedEmojis.map((emoji) => ({
          emojiCode: emoji.emojiCode,
          emojiCount: emoji.emojiCount,
          isClicked: emoji.isClicked,
        })),
      },
    );
  }

  async deleteFeed(feedId: number, memberId: number): Promise<void> {
    const feedInfo = await this.feedQueryRepository.getIsNotDeletedFeed(feedId);

    if (!feedInfo) {
      throw new NotFoundException('해당 포스트를 찾을 수 없습니다.');
    }

    if (feedInfo.memberId !== memberId) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    feedInfo.deleteFeed(new Date());

    await this.feedRepository.save(feedInfo);
  }

  async postFeedEmoji(feedId: number, memberId: number, emoji: string) {
    const feed = await this.feedDomainService.getFeedIsNotDeleted(feedId);

    feed.plusEmojiCount(feed.emojiCount);
    await this.feedRepository.save(feed);

    await this.feedEmojiRepository.save({
      feedId,
      memberId,
      emoji,
    });

    await this.feedEmojiNotification(feed.memberId, memberId, feedId);
  }

  private async feedEmojiNotification(receivedMemberId, sendMemberId, feedId) {
    const sendMember = await this.memberDomainService.getMemberIsNotDeletedById(sendMemberId);

    await this.notificationDomainService.saveNotification({
      receivedMemberId,
      sendMemberId,
      notificationType: {
        type: NotificationType.CREATE_FEED_EMOJI,
        feedId,
      },
      content: `${sendMember.nickname}님이 회원님의 피드에 이모지를 남겼습니다.`,
    });
  }

  async deleteFeedEmoji(feedId: number, memberId: number, emojiCode: string) {
    const feed = await this.feedDomainService.getFeedIsNotDeleted(feedId);

    const emoji = await this.feedEmojiRepository.findOneBy({ feedId, memberId, emoji: emojiCode });

    if (!emoji) {
      throw new NotFoundException('해당 이모지를 찾을 수 없습니다.');
    }

    if (emoji.memberId !== memberId) {
      throw new UnauthorizedException('삭제 권한이 없습니다.');
    }

    feed.minusEmojiCount(feed.emojiCount);
    await this.feedRepository.save(feed);

    await this.feedEmojiRepository.remove(emoji);
  }
}

export class FeedWriterDto {
  id: number;
  nickname: string;
  generation: number;
  profileImageUrl: string;
}

export class FeedDto {
  id: number;
  content: string;
  viewCount: number;
  commentCount: number;
  emojiCount: number;
  createdAt: Date;
  imageUrls: string[];
  emojis: GetFeedEmojiDto[];
}

export class FeedDetailDto extends FeedDto {
  isMine: boolean;
}

export class GetFeedEmojiDto {
  emojiCode: EmojiType;
  emojiCount: number;
  isClicked: boolean;
}
