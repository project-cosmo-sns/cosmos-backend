import { ApiProperty } from '@nestjs/swagger';
import { PostListDto, PostWriterDto } from 'src/service/post.service';
import { PostDetailHashTag } from './post-detail.response';
import { GetPostListDto } from '../get-post-list.dto';

export class PostListInfo {
  @ApiProperty({
    type: {
      id: { type: 'number' },
      nickname: { type: 'string' },
      generation: { type: 'number' },
      profileImageUrl: { type: 'string' },
    },
  })
  writer: PostWriterDto;
  @ApiProperty({
    type: {
      id: { type: 'number' },
      category: { type: 'string' },
      title: { type: 'string' },
      content: { type: 'string' },
      viewCount: { type: 'number' },
      commentCount: { type: 'number' },
      emojiCount: { type: 'number' },
      createdAt: { type: 'string' },
    },
  })
  post: PostListDto;

  constructor(writer: PostWriterDto, post: PostListDto) {
    this.writer = writer;
    this.post = post;
  }
}

export class PostListResponse {
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
    return new PostListResponse(postList, getPostList.hashTag)
  }
}