import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { Roles } from 'src/common/roles/roles.decorator';
import { CreatePostInfoDto } from 'src/dto/create-post-dto';
import { SortPostList } from 'src/dto/request/sort-post-list.request';
import { PostListResponse } from 'src/dto/response/post-list.response';
import { RolesGuard } from 'src/guard/roles.guard';
import { PostService } from 'src/service/post.service';

@ApiTags('Post')
@Controller('post')
@UseGuards(RolesGuard)
export class PostController {
  constructor(private readonly postService: PostService) { }

  @ApiOperation({ summary: '포스트 작성' })
  @Post('create')
  async createPost(@Req() req, @Body() createPostInfo: CreatePostInfoDto): Promise<void> {
    return this.postService.createPost(req.user.id, createPostInfo);
  }

  @Roles('anyone')
  @ApiOperation({ summary: '포스트 목록' })
  @Get('list')
  async getPostList(
    @Req() req,
    @Query() sortPostList: SortPostList
  ): Promise<PaginationResponse<PostListResponse>> {
    const { postInfo, totalCount } = await this.postService.getPostList(2, sortPostList);
    return PaginationResponse.of({
      data: PostListResponse.from(postInfo),
      options: sortPostList,
      totalCount,
    })
  }
}