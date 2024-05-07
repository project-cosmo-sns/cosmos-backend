import { EmojiType } from 'src/entity/common/Enums';
import { GetPostEmojiTuple } from 'src/repository/post-emoji.query-repository';
import { GetProfilePostListHashTagTuple, GetProfilePostTuple } from 'src/repository/profile.query-repository';
import { ProfilePostListDto, ProfilePostWriterDto } from 'src/service/profile.service';

export class GetProfilePostDto {
  postList!: GetProfilePostList;
  constructor(postList: GetProfilePostList) {
    this.postList = postList;
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
    hashTags: GetProfileHashTagListInfo[],
    emojis: GetProfileEmojiListInfo[]
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
      emojis,
    };
  }

  static from(tuple: GetProfilePostTuple, hashTagTuple: GetProfilePostListHashTagTuple[], emojiTuple: GetPostEmojiTuple[]) {
    const hashTags: GetProfileHashTagListInfo[] = hashTagTuple.map(tag => new GetProfileHashTagListInfo(tag.tagName, tag.color));
    const emojis: GetProfileEmojiListInfo[] = emojiTuple.map(emoji => new GetProfileEmojiListInfo(emoji.emojiCode, emoji.emojiCount, emoji.isClicked));
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
      hashTags,
      emojis,
    );
  }
}

export class GetProfileHashTagListInfo {
  tagName!: string;
  color!: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }
}

export class GetProfileEmojiListInfo {
  emojiCode!: EmojiType;
  emojiCount!: number;
  isClicked!: boolean;

  constructor(emojiCode: EmojiType, emojiCount: number, isClicked: boolean) {
    this.emojiCode = emojiCode;
    this.emojiCount = emojiCount;
    this.isClicked = isClicked;
  }
}
