import { Injectable, NotFoundException } from '@nestjs/common';
import { FeedQueryRepository } from 'src/repository/feed.query-repository';

@Injectable()
export class FeedDomainService {
  constructor(private readonly feedQueryRepository: FeedQueryRepository) {}

  async getFeedIsNotDeleted(feedId: number) {
    const feed = await this.feedQueryRepository.getIsNotDeletedFeed(feedId);

    if (!feed) {
      throw new NotFoundException('해당 피드를 찾을 수 없습니다.');
    }

    return feed;
  }
}
