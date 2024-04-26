import { GetPostCommentTuple } from 'src/repository/post-comment.query-repository';

export class GetPostCommentList {
  memberId!: number;
  nickname!: string;
  generation!: number;
  profileImageUrl!: string;
  commentId!: number;
  content!: string;
  heartCount!: number;
  createdAt!: Date;
  isHearted!: boolean;

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
  ) {
    this.memberId = memberId;
    this.nickname = nickname;
    this.generation = generation;
    this.profileImageUrl = profileImageUrl;
    this.commentId = commentId;
    this.content = content;
    this.heartCount = heartCount;
    this.createdAt = createdAt;
    this.isHearted = isHearted;
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
      tuple.isHearted
    )
  }
}