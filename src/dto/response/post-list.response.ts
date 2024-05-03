import { ApiProperty } from '@nestjs/swagger';
import { PostListDto, PostWriterDto } from 'src/service/post.service';
import { PostDetailHashTag } from './post-detail.response';
import { GetPostList, GetPostListDto } from '../get-post-list.dto';

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
  postDetailHashTag!: PostDetailHashTag[];


  constructor(postListInfo: PostListInfo, postDetailHashTag: PostDetailHashTag[]) {
    this.postListInfo = postListInfo;
    this.postDetailHashTag = postDetailHashTag;
  }

  static from(getPostList: GetPostListDto) {
    const postList = new PostListInfo(
      getPostList.postList.writer,
      getPostList.postList.post,
    );
    return new PostListResponse(postList, getPostList.hashTag)
  }
}