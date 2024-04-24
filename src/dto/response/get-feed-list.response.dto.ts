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
  @ApiProperty()
  writer: FeedWriterResponseDto;
  @ApiProperty()
  feed: FeedResponseDto;

  constructor(writer: FeedWriterDto, feed: FeedDto) {
    this.writer = writer;
    this.feed = feed;
  }

  static from({ writer, feed }: { writer: FeedWriterDto; feed: FeedDto }) {
    return new GetFeedListResponseDto(writer, feed);
  }
}
