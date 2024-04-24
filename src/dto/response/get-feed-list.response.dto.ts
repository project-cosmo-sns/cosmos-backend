import { ApiProperty } from '@nestjs/swagger';
import { FeedDto, FeedWriterDto } from 'src/service/feed.service';

export class FeedWriterResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nickname: string;
  @ApiProperty()
  generation: number;
  @ApiProperty()
  profileImageUrl: string;
}

export class FeedResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  content: string;
  @ApiProperty()
  viewCount: number;
  @ApiProperty()
  commentCount: number;
  @ApiProperty()
  emojiCount: number;
  @ApiProperty()
  createdAt: Date;
}

export class GetFeedListResponseDto {
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
    return new GetFeedListResponseDto(writer, feed);
  }
}
