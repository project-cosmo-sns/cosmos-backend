import { EmojiType } from 'src/entity/common/Enums';
import { GetPostDetailHashTagTuple, GetPostDetailTuple } from 'src/repository/post.query-repository';
import { PostDetailDto, PostWriterDto } from 'src/service/post.service';

export class GetPostDetailDto {
  postDetail!: GetPostDetail;
  emoji!: GetEmojiInfo[];
  constructor(postDetail: GetPostDetail, emoji: GetEmojiInfo[]) {
    this.postDetail = postDetail;
    this.emoji = emoji;
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
    hashTags: GetHashTagInfo[],
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
      hashTags,
    };
  }

  static from(tuple: GetPostDetailTuple, hashTagTuple: GetPostDetailHashTagTuple[]) {
    const hashTags: GetHashTagInfo[] = hashTagTuple.map(tag => new GetHashTagInfo(tag.tagName, tag.color));
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
      hashTags
    );
  }
}

export class GetHashTagInfo {
  tagName?: string;
  color?: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }
}

export class GetEmojiInfo {
  emojiCode: EmojiType;
  emojiCount: number;
  isClicked: boolean;

  constructor(emojiCode: EmojiType, emojiCount: number, isClicked: boolean) {
    this.emojiCode = emojiCode;
    this.emojiCount = emojiCount;
    this.isClicked = isClicked;
  }
}
