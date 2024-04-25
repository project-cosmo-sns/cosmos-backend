export class GetPostDetail {
  memberId!: number;
  nickname!: string;
  profileImageUrl!: string;
  createdAt!: Date;
  postId!: number;
  title!: string;
  content!: string;
  emojiCount!: number;
  commentCount!: number;
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