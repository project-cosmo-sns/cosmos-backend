import { ApiProperty } from '@nestjs/swagger';
import { PostCommentDto, PostCommentWriterDto } from 'src/service/post.service';

export class PostCommentListResponse {
  @ApiProperty({
    type: {
      id: { type: 'number' },
      nickname: { type: 'string' },
      generation: { type: 'number' },
      profileImageUrl: { type: 'string' },
    },
  })
  writer: PostCommentWriterDto;
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
  comment: PostCommentDto;
  constructor(writer: PostCommentWriterDto, comment: PostCommentDto) {
    this.writer = writer;
    this.comment = comment;
  }

  static from({ writer, comment }: { writer: PostCommentWriterDto; comment: PostCommentDto }) {
    return new PostCommentListResponse(writer, comment);
  }
}
