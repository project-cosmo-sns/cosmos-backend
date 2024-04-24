import { ApiProperty } from '@nestjs/swagger';
import { FeedDto, FeedWriterDto } from 'src/service/feed.service';

export class GetFeedResponseDto {
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
    },
  })
  feed: FeedDto;

  constructor(writer: FeedWriterDto, feed: FeedDto) {
    this.writer = writer;
    this.feed = feed;
  }

  static from({ writer, feed }: { writer: FeedWriterDto; feed: FeedDto }) {
    return new GetFeedResponseDto(writer, feed);
  }
}
