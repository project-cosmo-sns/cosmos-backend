import { ApiProperty } from '@nestjs/swagger';
import { GetPostList } from '../get-post-list.dto';
import { PostDto, PostWriterDto } from 'src/service/post.service';

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
  post: PostDto;

  constructor(writer: PostWriterDto, post: PostDto) {
    this.writer = writer;
    this.post = post;
  }

  static from({ writer, post }: { writer: PostWriterDto; post: PostDto }) {
    return new PostListResponse(writer, post);
  }
}