import { ApiProperty } from '@nestjs/swagger';
import { PostReplyDto, PostReplyWriterDto } from 'src/service/post-reply.service';

export class PostReplyListResponse {
  @ApiProperty({
    type: {
      id: { type: 'number' },
      nickname: { type: 'string' },
      generation: { type: 'number' },
      profileImageUrl: { type: 'string' },
    },
  })
  writer: PostReplyWriterDto;
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
  reply: PostReplyDto;

  constructor(writer: PostReplyWriterDto, reply: PostReplyDto) {
    this.writer = writer;
    this.reply = reply;
  }

  static from({ writer, reply }: { writer: PostReplyWriterDto; reply: PostReplyDto; }) {
    return new PostReplyListResponse(writer, reply);
  }
}