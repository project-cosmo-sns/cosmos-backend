import { ApiProperty } from '@nestjs/swagger';
import { GetPostDetail, GetPostDetailDto } from '../get-post-detail.dto';
import { PostDto, PostWriterDto } from 'src/service/post.service';

export class PostDetail {
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
}
export class PostDetailHashTag {
  @ApiProperty()
  tagName?: string;
  @ApiProperty()
  color?: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }
}

export class PostDetailResponse {
  @ApiProperty({ type: PostDetail })
  postDetail!: PostDetail;
  @ApiProperty({ type: [PostDetailHashTag] })
  postDetailHashTag!: PostDetailHashTag[];

  constructor(postDetail: PostDetail, postDetailHashTag: PostDetailHashTag[]) {
    this.postDetail = postDetail;
    this.postDetailHashTag = postDetailHashTag;
  }

  static from(getPostDetail: GetPostDetailDto) {
    const postDetail = new PostDetail(
      getPostDetail.postDetail.writer,
      getPostDetail.postDetail.post,
    );
    return new PostDetailResponse(postDetail, getPostDetail.hashTag)
  }
}