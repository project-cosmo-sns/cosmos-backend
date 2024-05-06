import { ApiProperty } from '@nestjs/swagger';
import { PostListInfo } from '../post-list.response';
import { GetPostListDto } from 'src/dto/get-post-list.dto';

export class ProfilePostResponse {
  @ApiProperty({ type: PostListInfo })
  postListInfo!: PostListInfo;

  constructor(postListInfo: PostListInfo) {
    this.postListInfo = postListInfo;
  }

  static from(getPostList: GetPostListDto) {
    const postList = new PostListInfo(
      getPostList.postList.writer,
      getPostList.postList.post,
      getPostList.emoji,
    );
    return new ProfilePostResponse(postList);
  }
}