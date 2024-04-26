import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { ApiPaginatedResponse } from 'src/common/pagination/pagination.decorator';
import { Roles } from 'src/common/roles/roles.decorator';
import { CreatePostInfoDto } from 'src/dto/create-post-dto';
import { SortPostList } from 'src/dto/request/sort-post-list.request';
import { PostDetailResponse } from 'src/dto/response/post-detail.response';
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
  @ApiPaginatedResponse(PostListResponse)
  @Get('list')
  async getPostList(
    @Req() req,
    @Query() sortPostList: SortPostList
  ): Promise<PaginationResponse<PostListResponse>> {
    const { postInfo, totalCount } = await this.postService.getPostList(req.user.id, sortPostList);
    return PaginationResponse.of({
      data: PostListResponse.from(postInfo),
      options: sortPostList,
      totalCount,
    })
  }
  
  @ApiOperation({ summary: '포스트 상세' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @ApiResponse({ type: PostDetailResponse })
  @Get(':postId/detail')
  async getPostDetail(@Param('postId', ParseIntPipe) postId: number): Promise<PostDetailResponse> {
    const postDetail = await this.postService.getPostDetail(postId);
    return PostDetailResponse.from(postDetail);
  }
}