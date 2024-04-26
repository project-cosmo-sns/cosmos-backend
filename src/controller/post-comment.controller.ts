import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { ApiPaginatedResponse } from 'src/common/pagination/pagination.decorator';
import { Roles } from 'src/common/roles/roles.decorator';
import { PostCommentListResponse } from 'src/dto/response/post-comment-list.response';
import { RolesGuard } from 'src/guard/roles.guard';
import { PostCommentService } from 'src/service/post-comment.service';

@ApiTags('포스트 댓글')
@Controller('post/comment')
@UseGuards(RolesGuard)
export class PostCommentController {
  constructor(private readonly postCommentService: PostCommentService) { }


  @ApiOperation({ summary: '포스트 댓글 목록' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @ApiPaginatedResponse(PostCommentListResponse)
  @Get(':postId/list')
  async getPostCommentList(
    @Req() req,
    @Query() paginationRequest: PaginationRequest,
    @Param('postId', ParseIntPipe) postId: number
  ): Promise<PaginationResponse<PostCommentListResponse>> {
    const { postCommentInfo, totalCount } = await this.postCommentService.getPostCommentList(postId, req.user.id, paginationRequest);
    return PaginationResponse.of({
      data: PostCommentListResponse.from(postCommentInfo),
      options: paginationRequest,
      totalCount,
    })
  }

  @ApiOperation({ summary: '포스트 댓글 쓰기' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @Post(':postId/write')
  async writePostComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req,
    @Body('content') content: string,
  ): Promise<void> {
    return this.postCommentService.writePostComment(postId, req.user.id, content);
  }
}