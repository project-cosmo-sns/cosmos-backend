import { GetPostListTuple } from 'src/repository/post.query-repository';
import { PostListDto, PostWriterDto } from 'src/service/post.service';

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

  static from(tuple: GetPostListTuple) {
    return new GetPostList(
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