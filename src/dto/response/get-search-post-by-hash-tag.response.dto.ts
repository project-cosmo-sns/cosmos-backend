import { ApiProperty } from '@nestjs/swagger';

class PostWriterDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nickname: string;
  @ApiProperty()
  generation: number;
  @ApiProperty()
  profileImageUrl: string;
}

class PostDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  content: string;
  @ApiProperty()
  viewCount: number;
  @ApiProperty()
  commentCount: number;
  @ApiProperty()
  emojiCount: number;
  @ApiProperty()
  createdAt: string;
}

export class GetSearchPostByHashTagResponseDto {
  @ApiProperty({ type: PostWriterDto })
  writer: PostWriterDto;
  @ApiProperty({ type: PostDto })
  post: PostDto;

  constructor(writer: PostWriterDto, post: PostDto) {
    this.writer = writer;
    this.post = post;
  }

  static from({ writer, post }: { writer: PostWriterDto; post: PostDto }) {
    return new GetSearchPostByHashTagResponseDto(writer, post);
  }
}
