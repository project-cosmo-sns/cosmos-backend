import { ApiProperty } from '@nestjs/swagger';
import { PostListInfo } from '../post-list.response';
import { PostDetailHashTag } from '../post-detail.response';
import { GetPostListDto } from 'src/dto/get-post-list.dto';

export class ProfilePostResponse {
  @ApiProperty({ type: PostListInfo })
  postListInfo!: PostListInfo;
  @ApiProperty({ type: [PostDetailHashTag] })
  postListHashTag!: PostDetailHashTag[];
  
  constructor(postListInfo: PostListInfo, postListHashTag: PostDetailHashTag[]) {
    this.postListInfo = postListInfo;
    this.postListHashTag = postListHashTag;
  }

  static from(getPostList: GetPostListDto) {
    const postList = new PostListInfo(
      getPostList.postList.writer,
      getPostList.postList.post,
    );
    return new ProfilePostResponse(postList, getPostList.hashTag)
  }
}