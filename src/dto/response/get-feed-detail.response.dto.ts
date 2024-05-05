import { ApiProperty } from '@nestjs/swagger';
import { FeedDetailDto, FeedWriterDto } from 'src/service/feed.service';

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
