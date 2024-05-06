import { ApiProperty } from '@nestjs/swagger';
import { GetPostDetailDto } from '../get-post-detail.dto';
import { PostDetailDto, PostWriterDto } from 'src/service/post.service';
import { EmojiDetailResponse } from './emoji-detail.response';

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
      hashTags: { type: [PostDetailHashTag] }
    },
  })
  post: PostDetailDto;

  @ApiProperty({ type: [EmojiDetailResponse] })
  emoji!: EmojiDetailResponse[];

  constructor(writer: PostWriterDto, post: PostDetailDto, emoji: EmojiDetailResponse[]) {
    this.writer = writer;
    this.post = post;
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
      getPostDetail.emoji,
    );
    return new PostDetailResponse(postDetail);
  }
}
