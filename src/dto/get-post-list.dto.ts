import { GetPostListHashTagTuple, GetPostListTuple } from 'src/repository/post.query-repository';
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
    hashTags: GetHashTagListInfo[]
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

  static from(tuple: GetPostListTuple, hashTagTuple: GetPostListHashTagTuple[]) {
    const hashTags: GetHashTagListInfo[] = hashTagTuple.map(tag => new GetHashTagListInfo(tag.tagName, tag.color));
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
      hashTags
    );
  }
}

export class GetHashTagListInfo {
  tagName?: string;
  color?: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }
}