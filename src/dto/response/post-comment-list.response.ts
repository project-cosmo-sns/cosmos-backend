import { ApiProperty } from '@nestjs/swagger';
import { GetPostCommentList } from '../get-post-comment-list.dto';

export class PostCommentListResponse {
  @ApiProperty()
  memberId!: number;
  @ApiProperty()
  nickname!: string;
  @ApiProperty()
  generation!: number;
  @ApiProperty()
  profileImageUrl!: string;
  @ApiProperty()
  commentId!: number;
  @ApiProperty()
  content!: string;
  @ApiProperty()
  heartCount!: number;
  @ApiProperty()
  createdAt!: Date;
  @ApiProperty()
  isHearted!: Boolean;

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

  static from(getPostCommentLists: GetPostCommentList[]) {
    return getPostCommentLists.map(
      (commentLists) =>
        new PostCommentListResponse(
          commentLists.memberId,
          commentLists.nickname,
          commentLists.generation,
          commentLists.profileImageUrl,
          commentLists.commentId,
          commentLists.content,
          commentLists.heartCount,
          commentLists.createdAt,
          commentLists.isHearted
        )
    )
  }
}