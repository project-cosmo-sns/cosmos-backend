import { ApiProperty } from '@nestjs/swagger';
import { GetPostDetailDto } from '../get-post-detail.dto';
import { PostDetailDto, PostWriterDto } from 'src/service/post.service';
import { EmojiListResponse } from './emoji-list.response';

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
      isMine: { type: 'boolean' },
    },
  })
  post: PostDetailDto;
  @ApiProperty({ type: [PostDetailHashTag] })
  hashTags!: PostDetailHashTag[];

  @ApiProperty({ type: [EmojiListResponse] })
  emoji!: EmojiListResponse[];

  constructor(writer: PostWriterDto, post: PostDetailDto, hashTags: PostDetailHashTag[], emoji: EmojiListResponse[]) {
    this.writer = writer;
    this.post = post;
    this.hashTags = hashTags;
    this.emoji = emoji;
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
      getPostDetail.hashTags,
      getPostDetail.emoji,
    );
    return new PostDetailResponse(postDetail);
  }
}
