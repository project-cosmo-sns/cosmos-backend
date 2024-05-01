import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { GetFeedResponseDto } from 'src/dto/response/get-feed.response.dto';
import { Feed } from 'src/entity/feed.entity';
import { FeedEmoji } from 'src/entity/feed_emoji.entity';
import { FeedQueryRepository } from 'src/repository/feed.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Feed) private readonly feedRepository: Repository<Feed>,
    @InjectRepository(FeedEmoji) private readonly feedEmojiRepository: Repository<FeedEmoji>,
    private readonly feedQueryRepository: FeedQueryRepository,
  ) {}

  async postFeed(memberId: number, content: string): Promise<void> {
    const feed = new Feed();

    feed.memberId = memberId;
    feed.content = content;

    await this.feedRepository.save(feed);
  }

  async getFeedList(
    paginationRequest: PaginationRequest,
  ): Promise<{ feedList: GetFeedResponseDto[]; totalCount: number }> {
    const getFeedListTuple = await this.feedQueryRepository.getFeedList(paginationRequest);
    const totalCount = await this.feedQueryRepository.getFeedListCount();

    const feedList = getFeedListTuple.map((item) => {
      const writer = {
        id: item.writerId,
        nickname: item.writerNickname,
        generation: item.writerGeneration,
        profileImageUrl: item.writerProfileImageUrl,
      };

      const feed = {
        id: item.feedId,
        content: item.feedContent,
        viewCount: item.feedViewCount,
        commentCount: item.feedCommentCount,
        emojiCount: item.feedEmojiCount,
        createdAt: item.feedCreatedAt,
      };

      return GetFeedResponseDto.from({ writer, feed });
    });

    return { feedList, totalCount };
  }

  async getFeedDetail(feedId: number) {
    const feed = await this.feedQueryRepository.getFeedDetail(feedId);

    if (!feed) {
      throw new NotFoundException('해당 피드를 찾을 수 없습니다.');
    }

    return new GetFeedResponseDto(
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
    const feed = await this.feedQueryRepository.getIsNotDeletedFeed(feedId);

    if (!feed) {
      throw new NotFoundException('해당 피드를 찾을 수 없습니다.');
    }

    feed.plusEmojiCount(feed.emojiCount);
    await this.feedRepository.save(feed);

    await this.feedEmojiRepository.save({
      feedId,
      memberId,
      emoji,
    });
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
}
