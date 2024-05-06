import { ApiProperty } from '@nestjs/swagger';
import { EmojiType } from 'src/entity/common/Enums';

export class SearchedPostHashTag {
  @ApiProperty()
  tagName!: string;
  @ApiProperty()
  color!: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }
}

export class SearchedPostListEmoji {
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
  @ApiProperty({ type: SearchedPostHashTag })
  hashTags: SearchedPostHashTag[];
  @ApiProperty({ type: SearchedPostListEmoji })
  emojis: SearchedPostListEmoji[];
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
