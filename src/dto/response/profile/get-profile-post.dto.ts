import { EmojiType } from 'src/entity/common/Enums';
import { GetProfilePostListHashTagTuple, GetProfilePostTuple } from 'src/repository/profile.query-repository';
import { ProfilePostListDto, ProfilePostWriterDto } from 'src/service/profile.service';

export class GetProfilePostDto {
  postList!: GetProfilePostList;
  emoji!: GetProfileEmojiListInfo[];
  constructor(postList: GetProfilePostList, emoji: GetProfileEmojiListInfo[]) {
    this.postList = postList;
    this.emoji = emoji;
  }
}


export class GetProfilePostList {
  writer: ProfilePostWriterDto;
  post: ProfilePostListDto;

  constructor(
    memberId: number,
    nickname: string,
    generation: number,
    profileImageUrl: string,
    createdAt: Date,
    postId: number,
    category: string,
    title: string,
    content: string,
    emojiCount: number,
    commentCount: number,
    viewCount: number,
    hashTags: GetProfileHashTagListInfo[]
  ) {
    this.writer = {
      id: memberId,
      nickname,
      generation,
      profileImageUrl,
    };
    this.post = {
      id: postId,
      category,
      title,
      content,
      emojiCount,
      commentCount,
      viewCount,
      createdAt,
      hashTags,
    };
  }

  static from(tuple: GetProfilePostTuple, hashTagTuple: GetProfilePostListHashTagTuple[]) {
    const hashTags: GetProfileHashTagListInfo[] = hashTagTuple.map(tag => new GetProfileHashTagListInfo(tag.tagName, tag.color));
    return new GetProfilePostList(
      tuple.memberId,
      tuple.nickname,
      tuple.generation,
      tuple.profileImageUrl,
      tuple.createdAt,
      tuple.postId,
      tuple.category,
      tuple.title,
      tuple.content,
      tuple.emojiCount,
      tuple.commentCount,
      tuple.viewCount,
      hashTags
    );
  }
}

export class GetProfileHashTagListInfo {
  tagName?: string;
  color?: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }
}

export class GetProfileEmojiListInfo {
  emojiCode: EmojiType;
  emojiCount: number;
  isClicked: boolean;

  constructor(emojiCode: EmojiType, emojiCount: number, isClicked: boolean) {
    this.emojiCode = emojiCode;
    this.emojiCount = emojiCount;
    this.isClicked = isClicked;
  }
}
