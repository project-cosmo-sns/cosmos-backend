import { ApiProperty } from '@nestjs/swagger';
import { GetPostDetailDto } from '../get-post-detail.dto';
import { PostDetailDto, PostWriterDto } from 'src/service/post.service';


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
      category: { type: 'string' },
      title: { type: 'string' },
      content: { type: 'string' },
      viewCount: { type: 'number' },
      commentCount: { type: 'number' },
      emojiCount: { type: 'number' },
      createdAt: { type: 'string' },
    },
  })
  post: PostDetailDto;
  @ApiProperty({ type: [PostDetailHashTag] })
  hashTag!: PostDetailHashTag[];

  constructor(writer: PostWriterDto, post: PostDetailDto, hashTag: PostDetailHashTag[]) {
    this.writer = writer;
    this.post = post;
    this.hashTag = hashTag;
  }
}


export class PostDetailResponse {
  @ApiProperty({ type: PostDetail })
  postDetail!: PostDetail;

  constructor(postDetail: PostDetail) {
    this.postDetail = postDetail;
  }

  static from(getPostDetail: GetPostDetailDto) {
    const postDetail = new PostDetail(
      getPostDetail.postDetail.writer,
      getPostDetail.postDetail.post,
      getPostDetail.hashTag
    );
    return new PostDetailResponse(postDetail);
  }
}