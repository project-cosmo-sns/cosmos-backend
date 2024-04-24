import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { GetFeedListResponseDto } from 'src/dto/response/get-feed-list.response.dto';
import { Feed } from 'src/entity/feed.entity';
import { FeedQueryRepository } from 'src/repository/feed.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Feed) private readonly feedRepository: Repository<Feed>,
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
  ): Promise<{ feedList: GetFeedListResponseDto[]; totalCount: number }> {
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

      return GetFeedListResponseDto.from({ writer, feed });
    });

    return { feedList, totalCount };
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
