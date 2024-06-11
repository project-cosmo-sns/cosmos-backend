import { GetPostReplyTuple } from 'src/repository/post-comment.query-repository';
import { PostReplyDto, PostReplyWriterDto } from 'src/service/post-reply.service';

export class GetPostReplyList {
  writer: PostReplyWriterDto;
  reply: PostReplyDto;

  constructor(
    memberId: number,
    nickname: string,
    generation: number,
    profileImageUrl: string,
    replyId: number,
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
    this.reply = {
      id: replyId,
      content,
      heartCount,
      createdAt,
      isHearted,
      isMine,
    };
  }

  static from(tuple: GetPostReplyTuple) {
    return new GetPostReplyList(
      tuple.memberId,
      tuple.nickname,
      tuple.generation,
      tuple.profileImageUrl,
      tuple.replyId,
      tuple.content,
      tuple.heartCount,
      tuple.createdAt,
      tuple.isHearted,
      tuple.isMine,
    );
  }
}
