import { ApiProperty } from '@nestjs/swagger';
import { EmojiType } from 'src/entity/common/Enums';
import { FeedDetailDto, FeedWriterDto } from 'src/service/feed.service';

export class FeedDetailEmoji {
  @ApiProperty()
  emojiCode!: EmojiType;
  @ApiProperty()
  emojiCount!: number;
  @ApiProperty()
  isClicked!: boolean;
  constructor(emojiCode: EmojiType, emojiCount: number, isClicked: boolean) {
    this.emojiCode = emojiCode;
    this.emojiCount = emojiCount;
    this.isClicked = isClicked;
  }
}

export class GetFeedDetailResponseDto {
  @ApiProperty({
    type: {
      id: { type: 'number' },
      nickname: { type: 'string' },
      generation: { type: 'number' },
      profileImageUrl: { type: 'string' },
    },
  })
  writer: FeedWriterDto;
  @ApiProperty({
    type: {
      id: { type: 'number' },
      content: { type: 'string' },
      viewCount: { type: 'number' },
      commentCount: { type: 'number' },
      emojiCount: { type: 'number' },
      createdAt: { type: 'string' },
      imageUrls: { type: 'array', items: { type: 'string' } },
      isMine: { type: 'boolean' },
      emojis: { type: [FeedDetailEmoji] }
    },
  })
  feed: FeedDetailDto;

  constructor(writer: FeedWriterDto, feed: FeedDetailDto) {
    this.writer = writer;
    this.feed = feed;
  }

  static from({ writer, feed }: { writer: FeedWriterDto; feed: FeedDetailDto }) {
    return new GetFeedDetailResponseDto(writer, feed);
  }
}
