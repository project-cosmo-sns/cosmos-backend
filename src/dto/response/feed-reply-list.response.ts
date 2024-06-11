import { ApiProperty } from '@nestjs/swagger';
import { FeedReplyDto, FeedReplyWriterDto } from 'src/service/feed-reply.service';


export class FeedReplyListResponse {
  @ApiProperty({
    type: {
      id: { type: 'number' },
      nickname: { type: 'string' },
      generation: { type: 'number' },
      profileImageUrl: { type: 'string' },
    },
  })
  writer: FeedReplyWriterDto;
  @ApiProperty({
    type: {
      id: { type: 'number' },
      content: { type: 'string' },
      heartCount: { type: 'number' },
      isHearted: { type: 'boolean' },
      createdAt: { type: 'string' },
      isMine: { type: 'boolean' },
    },
  })
  reply: FeedReplyDto;

  constructor(writer: FeedReplyWriterDto, reply: FeedReplyDto) {
    this.writer = writer;
    this.reply = reply;
  }

  static from({ writer, reply }: { writer: FeedReplyWriterDto; reply: FeedReplyDto; }) {
    return new FeedReplyListResponse(writer, reply);
  }
}