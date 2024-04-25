import { Controller, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { ApiPaginatedResponse } from 'src/common/pagination/pagination.decorator';
import { GetFeedCommentResponseDto } from 'src/dto/response/get-feed-comment.response.dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { FeedCommentService } from 'src/service/feed-comment.service';

@ApiTags('피드 댓글')
@Controller('feed/comment')
@UseGuards(RolesGuard)
export class FeedCommentController {
  constructor(
    private readonly feedCommentService: FeedCommentService,
  ) {}

  @ApiOperation({ summary: '피드 댓글 목록' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiPaginatedResponse(GetFeedCommentResponseDto)
  @Get('/:feedId/list')
  async getFeedComment(
    @Req() req,
    @Param('feedId', ParseIntPipe) feedId: number,
    @Query() paginationRequest: PaginationRequest,
  ): Promise<PaginationResponse<GetFeedCommentResponseDto>> {
    const { commentList, totalCount } = await this.feedCommentService.getFeedCommentList(
      feedId,
      req.user.id,
      paginationRequest,
    );

    return PaginationResponse.of({
      data: commentList,
      options: paginationRequest,
      totalCount,
    });
  }
}
