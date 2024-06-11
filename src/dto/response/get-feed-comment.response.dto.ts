import { ApiProperty } from '@nestjs/swagger';
import { FeedCommentDto, FeedCommentWriterDto } from 'src/service/feed-comment.service';
import { FeedWriterDto } from 'src/service/feed.service';

export class GetFeedCommentResponseDto {
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
      heartCount: { type: 'number' },
      isHearted: { type: 'boolean' },
      createdAt: { type: 'string' },
      isMine: { type: 'boolean' },
      isReplied: { type: 'boolean' },
    },
  })
  comment: FeedCommentDto;

  constructor(writer: FeedCommentWriterDto, comment: FeedCommentDto) {
    this.writer = writer;
    this.comment = comment;
  }

  static from({ writer, comment }: { writer: FeedWriterDto; comment: FeedCommentDto }) {
    return new GetFeedCommentResponseDto(writer, comment);
  }
}
