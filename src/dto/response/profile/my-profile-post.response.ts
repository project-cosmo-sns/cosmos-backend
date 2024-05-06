import { ApiProperty } from '@nestjs/swagger';
import { ProfilePostListDto, ProfilePostWriterDto } from 'src/service/profile.service';
import { EmojiType } from 'src/entity/common/Enums';
import { GetProfilePostDto } from './get-profile-post.dto';

export class ProfilePostListHashTag {
  @ApiProperty()
  tagName!: string;
  @ApiProperty()
  color!: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }
}

export class ProfilePostListEmoji {
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


export class ProfilePostListInfo {
  @ApiProperty({
    type: {
      id: { type: 'number' },
      nickname: { type: 'string' },
      generation: { type: 'number' },
      profileImageUrl: { type: 'string' },
    },
  })
  writer: ProfilePostWriterDto;
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
      hashTags: { type: [ProfilePostListHashTag] },
      emojis: { type: [ProfilePostListEmoji] }
    },
  })
  post: ProfilePostListDto;

  constructor(writer: ProfilePostWriterDto, post: ProfilePostListDto) {
    this.writer = writer;
    this.post = post;
  }
}

export class ProfilePostResponse {
  @ApiProperty({ type: ProfilePostListInfo })
  postListInfo!: ProfilePostListInfo;

  constructor(postListInfo: ProfilePostListInfo) {
    this.postListInfo = postListInfo;
  }

  static from(getPostList: GetProfilePostDto) {
    const postList = new ProfilePostListInfo(
      getPostList.postList.writer,
      getPostList.postList.post,
    );
    return new ProfilePostResponse(postList);
  }
}