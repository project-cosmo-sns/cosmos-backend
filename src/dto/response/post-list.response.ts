import { ApiProperty } from '@nestjs/swagger';
import { GetPostList } from '../get-post-list.dto';

export class PostListResponse {
  @ApiProperty()
  memberId!: number;
  @ApiProperty()
  nickname!: string;
  @ApiProperty()
  generation!: number;
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
    this.memberId = memberId;
    this.nickname = nickname;
    this.generation = generation;
    this.profileImageUrl = profileImageUrl;
    this.createdAt = createdAt;
    this.postId = postId;
    this.title = title;
    this.content = content;
    this.emojiCount = emojiCount;
    this.commentCount = commentCount;
    this.viewCount = viewCount;
  }

  static from(getPostLists: GetPostList[]) {
    return getPostLists.map(
      (getPostLists) =>
        new PostListResponse(
          getPostLists.memberId,
          getPostLists.nickname,
          getPostLists.generation,
          getPostLists.profileImageUrl,
          getPostLists.createdAt,
          getPostLists.postId,
          getPostLists.title,
          getPostLists.content,
          getPostLists.emojiCount,
          getPostLists.commentCount,
          getPostLists.viewCount
        )
    )
  }
}