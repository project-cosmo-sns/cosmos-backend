import { EmojiType } from 'src/entity/common/Enums';
import { GetPostEmojiTuple } from 'src/repository/post-emoji.query-repository';
import { GetPostHashTagTuple } from 'src/repository/post-hash-tag.query-repository';
import { GetPostDetailTuple } from 'src/repository/post.query-repository';
import { PostDetailDto, PostWriterDto } from 'src/service/post.service';

export class GetPostDetailDto {
  postDetail!: GetPostDetail;
  constructor(postDetail: GetPostDetail) {
    this.postDetail = postDetail;
  }
}

export class GetPostDetail {
  writer: PostWriterDto;
  post: PostDetailDto;

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
    isMine: boolean,
    isScraped: boolean,
    hashTags: GetHashTagDetailInfo[],
    emojis: GetEmojiDetailInfo[],
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
      isMine,
      isScraped,
      hashTags,
      emojis
    };
  }

  static from(tuple: GetPostDetailTuple, hashTagTuple: GetPostHashTagTuple[], emojiTuple: GetPostEmojiTuple[]) {
    const hashTags: GetHashTagDetailInfo[] = hashTagTuple.map(tag => new GetHashTagDetailInfo(tag.tagName, tag.color));
    const emojis: GetEmojiDetailInfo[] = emojiTuple.map(emoji => new GetEmojiDetailInfo(emoji.emojiCode, emoji.emojiCount, emoji.isClicked));
    return new GetPostDetail(
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
      tuple.isMine,
      tuple.isScraped,
      hashTags,
      emojis
    );
  }
}

export class GetHashTagDetailInfo {
  tagName?: string;
  color?: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }
}

export class GetEmojiDetailInfo {
  emojiCode: EmojiType;
  emojiCount: number;
  isClicked: boolean;

  constructor(emojiCode: EmojiType, emojiCount: number, isClicked: boolean) {
    this.emojiCode = emojiCode;
    this.emojiCount = emojiCount;
    this.isClicked = isClicked;
  }
}
