import { Body, Controller, Get, InternalServerErrorException, NotFoundException, Param, ParseIntPipe, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
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
  @ApiResponse({ status: 401, description: '로그인 하지 않고 [기수순, 팔로우순]으로 정렬했을 경우' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없는 경우' })
  @Get('list')
  async getPostList(
    @Req() req,
    @Query() sortPostList: SortPostList
  ): Promise<PaginationResponse<PostListResponse>> {
    const userId = req.user?.id;
    try {
      const { postInfo, totalCount } = await this.postService.getPostList(userId, sortPostList);
      return PaginationResponse.of({
        data: PostListResponse.from(postInfo),
        options: sortPostList,
        totalCount,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('서버 오류가 발생했습니다.');
      }
    }
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