import { Body, Controller, Delete, Get, GoneException, InternalServerErrorException, Param, ParseIntPipe, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiGoneResponse, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
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

  @ApiOperation({ summary: '포스트 댓글 수정' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @ApiParam({ name: 'commentId', required: true, description: '포스트 댓글 id' })
  @ApiUnauthorizedResponse({ status: 401, description: '해당 댓글을 작성한 사람이 아닐 경우' })
  @ApiGoneResponse({ status: 410, description: '포스트가 삭제되었거나, 댓글이 삭제된 경우' })
  @Patch(':postId/:commentId/modify')
  async modifyPostComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
    @Body('content') content: string,
  ): Promise<void> {
    try { return this.postCommentService.patchPostComment(postId, commentId, req.user.id, content); }
    catch (error) {
      if (error instanceof UnauthorizedException || error instanceof GoneException) {
        throw error;
      } else {
        throw new InternalServerErrorException('서버 오류가 발생했습니다.');
      }
    }
  }

  @ApiOperation({ summary: '포스트 댓글 삭제' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @ApiParam({ name: 'commentId', required: true, description: '포스트 댓글 id' })
  @ApiUnauthorizedResponse({ status: 401, description: '해당 댓글을 작성한 사람이 아닐 경우' })
  @ApiGoneResponse({ status: 410, description: '포스트가 삭제되었거나, 댓글이 삭제된 경우' })
  @Delete(':postId/:commentId')
  async removePostComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req
  ): Promise<void> {
    try { return this.postCommentService.deletePostComment(postId, commentId, req.user.id); }

    catch (error) {
      if (error instanceof UnauthorizedException || error instanceof GoneException) {
        throw error;
      } else {
        throw new InternalServerErrorException('서버 오류가 발생했습니다.');
      }
    }
  }

  @ApiOperation({ summary: '포스트 댓글 좋아요' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @ApiParam({ name: 'commentId', required: true, description: '포스트 댓글 id' })
  @ApiGoneResponse({ status: 410, description: '포스트가 삭제되었거나, 댓글이 삭제된 경우' })
  @Post(':postId/:commentId/like')
  async likePostComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
  ): Promise<void> {
    try {
      return this.postCommentService.heartPostComment(postId, commentId, req.user.id);
    }
    catch (error) {
      if (error instanceof GoneException) {
        throw error;
      } else {
        throw new InternalServerErrorException('서버 오류가 발생했습니다.');
      }
    }
  }

  @ApiOperation({ summary: '포스트 댓글 좋아요 취소' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @ApiParam({ name: 'commentId', required: true, description: '포스트 댓글 id' })
  @ApiUnauthorizedResponse({ status: 401, description: '해당 댓글 좋아요를 누른 사람이 아닐 경우' })
  @ApiGoneResponse({ status: 410, description: '포스트가 삭제되었거나, 댓글이 삭제된 경우' })
  @Delete(':postId/:commentId/like')
  async removePostCommentHeart(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
  ): Promise<void> {
    try { return this.postCommentService.deletePostCommentHeart(postId, commentId, req.user.id); }
    catch (error) {
      if (error instanceof UnauthorizedException || error instanceof GoneException) {
        throw error;
      } else {
        throw new InternalServerErrorException('서버 오류가 발생했습니다.');
      }
    }
  }
}
