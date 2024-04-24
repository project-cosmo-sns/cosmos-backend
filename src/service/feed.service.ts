import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feed } from 'src/entity/feed.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FeedService {
  constructor(@InjectRepository(Feed) private readonly feedRepository: Repository<Feed>) {} // private readonly mypageQueryRepository: MyPageQueryRepository, // @InjectRepository(Member) private readonly memberRepository: Repository<Member>,

  async postFeed(memberId: number, content: string): Promise<void> {
    const feed = new Feed();

    feed.memberId = memberId;
    feed.content = content;

    await this.feedRepository.save(feed);
  }
}
