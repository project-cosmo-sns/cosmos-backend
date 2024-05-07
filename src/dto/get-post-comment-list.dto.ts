import { GetPostCommentTuple } from 'src/repository/post-comment.query-repository';
import { PostCommentDto, PostCommentWriterDto } from 'src/service/post.service';

export class GetPostCommentList {
  writer: PostCommentWriterDto;
  comment: PostCommentDto;

  constructor(
    memberId: number,
    nickname: string,
    generation: number,
    profileImageUrl: string,
    commentId: number,
    content: string,
    heartCount: number,
    createdAt: Date,
    isHearted: boolean,
    isMine: boolean,
  ) {
    this.writer = {
      id: memberId,
      nickname,
      generation,
      profileImageUrl,
    };
    this.comment = {
      id: commentId,
      content,
      heartCount,
      createdAt,
      isHearted,
      isMine,
    };
  }

  static from(tuple: GetPostCommentTuple) {
    return new GetPostCommentList(
      tuple.memberId,
      tuple.nickname,
      tuple.generation,
      tuple.profileImageUrl,
      tuple.commentId,
      tuple.content,
      tuple.heartCount,
      tuple.createdAt,
      tuple.isHearted,
      tuple.isMine,
    );
  }
}
