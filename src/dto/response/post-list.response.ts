import { ApiProperty } from '@nestjs/swagger';
import { PostListDto, PostWriterDto } from 'src/service/post.service';

export class PostListResponse {
  @ApiProperty({
    type: {
      id: { type: 'number' },
      nickname: { type: 'string' },
      generation: { type: 'number' },
      profileImageUrl: { type: 'string' },
    },
  })
  writer: PostWriterDto;
  @ApiProperty({
    type: {
      id: { type: 'number' },
      title: { type: 'string' },
      content: { type: 'string' },
      viewCount: { type: 'number' },
      commentCount: { type: 'number' },
      emojiCount: { type: 'number' },
      createdAt: { type: 'string' },
    },
  })
  post: PostListDto;

  constructor(writer: PostWriterDto, post: PostListDto) {
    this.writer = writer;
    this.post = post;
  }

  static from({ writer, post }: { writer: PostWriterDto; post: PostListDto }) {
    return new PostListResponse(writer, post);
  }
}