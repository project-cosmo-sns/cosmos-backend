import { GetPostDetailTuple } from 'src/repository/post.query-repository';
import { PostDto, PostWriterDto } from 'src/service/post.service';

export class GetPostDetailDto {
  postDetail!: GetPostDetail;
  hashTag!: GetHashTagInfo[];

  constructor(postDetail: GetPostDetail, hashTag: GetHashTagInfo[]) {
    this.postDetail = postDetail;
    this.hashTag = hashTag;
  }
}


export class GetPostDetail {
  writer: PostWriterDto;
  post: PostDto;

  constructor(
    memberId: number,
    nickname: string,
    generation: number,
    profileImageUrl: string,
    createdAt: Date,
    postId: number,
    title: string,
    content: string,
    emojiCount: number,
    commentCount: number,
    viewCount: number,
  ) {
    this.writer = {
      id: memberId,
      nickname,
      generation,
      profileImageUrl,
    };
    this.post = {
      id: postId,
      title,
      content,
      emojiCount,
      commentCount,
      viewCount,
      createdAt,
    };
  }

  static from(tuple: GetPostDetailTuple) {
    return new GetPostDetail(
      tuple.memberId,
      tuple.nickname,
      tuple.generation,
      tuple.profileImageUrl,
      tuple.createdAt,
      tuple.postId,
      tuple.title,
      tuple.content,
      tuple.emojiCount,
      tuple.commentCount,
      tuple.viewCount,
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