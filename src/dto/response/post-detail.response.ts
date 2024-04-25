import { ApiProperty } from '@nestjs/swagger';
import { GetPostDetail } from '../get-post-detail.dto';

export class PostDetailResponse {
  @ApiProperty()
  memberId!: number;
  @ApiProperty()
  nickname!: string;
  @ApiProperty()
  profileImageUrl!: string;
  @ApiProperty()
  createdAt!: Date;
  @ApiProperty()
  postId!: number;
  @ApiProperty()
  title!: string;
  @ApiProperty()
  content!: string;
  @ApiProperty()
  emojiCount!: number;
  @ApiProperty()
  commentCount!: number;
  @ApiProperty()
  viewCount!: number;

  constructor(
    memberId: number,
    nickname: string,
    profileImageUrl: string,
    createdAt: Date,
    postId: number,
    title: string,
    content: string,
    emojiCount: number,
    commentCount: number,
    viewCount: number,
  ) {
    this.memberId = memberId;
    this.nickname = nickname;
    this.profileImageUrl = profileImageUrl;
    this.createdAt = createdAt;
    this.postId = postId;
    this.title = title;
    this.content = content;
    this.emojiCount = emojiCount;
    this.commentCount = commentCount;
    this.viewCount = viewCount;
  }

  static from(getPostDetail: GetPostDetail) {
    const postDetail = new PostDetailResponse(
      getPostDetail.memberId,
      getPostDetail.nickname,
      getPostDetail.profileImageUrl,
      getPostDetail.createdAt,
      getPostDetail.postId,
      getPostDetail.title,
      getPostDetail.content,
      getPostDetail.emojiCount,
      getPostDetail.commentCount,
      getPostDetail.viewCount,
    );
    return postDetail;
  }
}