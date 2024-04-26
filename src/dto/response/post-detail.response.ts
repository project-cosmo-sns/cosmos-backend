import { ApiProperty } from '@nestjs/swagger';
import { GetPostDetail, GetPostDetailDto } from '../get-post-detail.dto';

export class PostDetail {
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


}
export class PostDetailHashTag {
  @ApiProperty()
  tagName?: string;
  @ApiProperty()
  color?: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }
}

export class PostDetailResponse {
  @ApiProperty({ type: PostDetail })
  postDetail!: PostDetail;
  @ApiProperty({ type: [PostDetailHashTag] })
  postDetailHashTag!: PostDetailHashTag[];

  constructor(postDetail: PostDetail, postDetailHashTag: PostDetailHashTag[]) {
    this.postDetail = postDetail;
    this.postDetailHashTag = postDetailHashTag;
  }

  static from(getPostDetail: GetPostDetailDto) {
    const postDetail = new PostDetail(
      getPostDetail.postDetail.memberId,
      getPostDetail.postDetail.nickname,
      getPostDetail.postDetail.profileImageUrl,
      getPostDetail.postDetail.createdAt,
      getPostDetail.postDetail.postId,
      getPostDetail.postDetail.title,
      getPostDetail.postDetail.content,
      getPostDetail.postDetail.emojiCount,
      getPostDetail.postDetail.commentCount,
      getPostDetail.postDetail.viewCount
    );
    return new PostDetailResponse(postDetail, getPostDetail.hashTag)
  }
}