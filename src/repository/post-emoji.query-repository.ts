import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Transform, plainToInstance } from 'class-transformer';
import { EmojiType } from 'src/entity/common/Enums';
import { PostEmoji } from 'src/entity/post_emoji.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PostEmojiQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

  async getPostEmoji(postId: number, memberId: number): Promise<GetPostEmojiTuple[]> {
    const emojiListInfo = await this.dataSource
      .createQueryBuilder()
      .from(PostEmoji, 'post_emoji')
      .select('post_emoji.emoji as emojiCode')
      .addSelect('COUNT(*) as emojiCount')
      .addSelect(
        'CASE WHEN SUM(CASE WHEN post_emoji.member_id = :memberId THEN 1 ELSE 0 END) > 0 THEN true ELSE false END as isClicked',
      )
      .where('post_emoji.post_id = :postId')
      .groupBy('post_emoji.emoji')
      .setParameters({ memberId, postId })
      .getRawMany();

    return plainToInstance(GetPostEmojiTuple, emojiListInfo);
  }
}

export class GetPostEmojiTuple {
  emojiCode!: EmojiType;
  emojiCount!: number;
  @Transform(({ value }) => value === '1')
  isClicked!: boolean;
}