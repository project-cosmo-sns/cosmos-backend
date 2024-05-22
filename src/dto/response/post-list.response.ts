import { ApiProperty } from '@nestjs/swagger';
import { PostListDto, PostWriterDto } from 'src/service/post.service';
import { GetPostListDto } from '../get-post-list.dto';
import { EmojiType } from 'src/entity/common/Enums';

export class PostListHashTag {
  @ApiProperty()
  tagName!: string;
  @ApiProperty()
  color!: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }
}

export class PostListEmoji {
  @ApiProperty()
  emojiCode!: EmojiType;
  @ApiProperty()
  emojiCount!: number;
  @ApiProperty()
  isClicked!: boolean;
  constructor(emojiCode: EmojiType, emojiCount: number, isClicked: boolean) {
    this.emojiCode = emojiCode;
    this.emojiCount = emojiCount;
    this.isClicked = isClicked;
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
      isScraped: { type: 'boolean' },
      hashTags: { type: [PostListHashTag] },
      emojis: { type: [PostListEmoji] }
    },
  })
  post: PostListDto;

  constructor(writer: PostWriterDto, post: PostListDto) {
    this.writer = writer;
    this.post = post;
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
    );
    return new PostListResponse(postList)
  }
}