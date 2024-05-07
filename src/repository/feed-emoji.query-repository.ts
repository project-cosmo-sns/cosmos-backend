import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Transform, plainToInstance } from 'class-transformer';
import { EmojiType } from 'src/entity/common/Enums';
import { FeedEmoji } from 'src/entity/feed_emoji.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class FeedEmojiQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

  async getFeedEmoji(feedId: number, memberId: number): Promise<GetFeedEmojiTuple[]> {
    const feedEmojiInfo = await this.dataSource
      .createQueryBuilder()
      .from(FeedEmoji, 'feed_emoji')
      .select('feed_emoji.emoji as emojiCode')
      .addSelect('COUNT(*) as emojiCount')
      .addSelect(
        'CASE WHEN SUM(CASE WHEN feed_emoji.member_id = :memberId THEN 1 ELSE 0 END) > 0 THEN true ELSE false END as isClicked',
      )
      .where('feed_emoji.feed_id = :feedId')
      .groupBy('feed_emoji.emoji')
      .setParameters({ memberId, feedId })
      .getRawMany();

    return plainToInstance(GetFeedEmojiTuple, feedEmojiInfo);
  }

}

export class GetFeedEmojiTuple {
  emojiCode!: EmojiType;
  emojiCount!: number;
  @Transform(({ value }) => value === '1')
  isClicked!: boolean;
}