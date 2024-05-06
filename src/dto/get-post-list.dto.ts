import { EmojiType } from 'src/entity/common/Enums';
import { GetPostListEmojiTuple, GetPostListHashTagTuple, GetPostTuple } from 'src/repository/post.query-repository';
import { PostListDto, PostWriterDto } from 'src/service/post.service';

export class GetPostListDto {
  postList!: GetPostList;
  constructor(postList: GetPostList) {
    this.postList = postList;
  }
}


export class GetPostList {
  writer: PostWriterDto;
  post: PostListDto;

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
    hashTags: GetHashTagListInfo[],
    emojis: GetEmojiListInfo[],
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
      emojis
    };
  }

  static from(tuple: GetPostTuple, hashTagTuple: GetPostListHashTagTuple[], emojiTuple: GetPostListEmojiTuple[]) {
    const hashTags: GetHashTagListInfo[] = hashTagTuple.map(tag => new GetHashTagListInfo(tag.tagName, tag.color));
    const emojis: GetEmojiListInfo[] = emojiTuple.map(emoji => new GetEmojiListInfo(emoji.emojiCode, emoji.emojiCount, emoji.isClicked));
    return new GetPostList(
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
      emojis
    );
  }
}

export class GetHashTagListInfo {
  tagName!: string;
  color!: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }
}

export class GetEmojiListInfo {
  emojiCode!: EmojiType;
  emojiCount!: number;
  isClicked!: boolean;

  constructor(emojiCode: EmojiType, emojiCount: number, isClicked: boolean) {
    this.emojiCode = emojiCode;
    this.emojiCount = emojiCount;
    this.isClicked = isClicked;
  }
}
