import { GetFeedReplyTuple } from 'src/repository/feed-comment.query-repository';
import { FeedReplyDto, FeedReplyWriterDto } from 'src/service/feed-reply.service';

export class GetFeedReplyList {
  writer: FeedReplyWriterDto;
  reply: FeedReplyDto;

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

  static from(tuple: GetFeedReplyTuple) {
    return new GetFeedReplyList(
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
