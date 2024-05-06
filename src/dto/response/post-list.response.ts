import { ApiProperty } from '@nestjs/swagger';
import { PostListDto, PostWriterDto } from 'src/service/post.service';
import { GetPostListDto } from '../get-post-list.dto';
import { EmojiListResponse } from './emoji-list.response';

export class PostListHashTag {
  @ApiProperty()
  tagName?: string;
  @ApiProperty()
  color?: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }
}

export class PostListInfo {
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
      hashTags: { type: [PostListHashTag] }
    },
  })
  post: PostListDto;

  @ApiProperty({ type: [EmojiListResponse] })
  emoji!: EmojiListResponse[];

  constructor(writer: PostWriterDto, post: PostListDto, emoji: EmojiListResponse[]) {
    this.writer = writer;
    this.post = post;
    this.emoji = emoji;
  }
}

export class PostListResponse {
  @ApiProperty({ type: PostListInfo })
  postListInfo!: PostListInfo;


  constructor(postListInfo: PostListInfo) {
    this.postListInfo = postListInfo;
  }

  static from(getPostList: GetPostListDto) {
    const postList = new PostListInfo(
      getPostList.postList.writer,
      getPostList.postList.post,
      getPostList.emoji
    );
    return new PostListResponse(postList)
  }
}