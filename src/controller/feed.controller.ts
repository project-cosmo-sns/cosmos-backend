import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { ApiPaginatedResponse } from 'src/common/pagination/pagination.decorator';
import { Roles } from 'src/common/roles/roles.decorator';
import { PostFeedRequestDto } from 'src/dto/request/post-feed.request.dto';
import { GetFeedCommentResponseDto } from 'src/dto/response/get-feed-comment.response.dto';
import { GetFeedResponseDto } from 'src/dto/response/get-feed.response.dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { FeedCommentService } from 'src/service/feed-comment.service';
import { FeedService } from 'src/service/feed.service';

@ApiTags('피드')
@Controller('feed')
@UseGuards(RolesGuard)
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly feedCommentService: FeedCommentService,
  ) {}

  @ApiOperation({ summary: '피드 작성' })
  @Post('')
  async postFeed(@Req() req, @Body() body: PostFeedRequestDto): Promise<void> {
    return this.feedService.postFeed(req.user.id, body.content);
  }

  @Roles('anyone')
  @ApiOperation({ summary: '피드 목록' })
  @ApiPaginatedResponse(GetFeedResponseDto)
  @Get('/list')
  async getFeedList(@Query() paginationRequest: PaginationRequest): Promise<PaginationResponse<GetFeedResponseDto>> {
    const { feedList, totalCount } = await this.feedService.getFeedList(paginationRequest);

    return PaginationResponse.of({
      data: feedList,
      options: paginationRequest,
      totalCount,
    });
  }

  @ApiOperation({ summary: '피드 상세' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiResponse({ type: GetFeedResponseDto })
  @Get('/:feedId/detail')
  async getFeedDetail(@Param('feedId', ParseIntPipe) feedId: number): Promise<GetFeedResponseDto> {
    const feed = await this.feedService.getFeedDetail(feedId);

    return feed;
  }

  @ApiOperation({ summary: '피드 삭제' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @Delete(':feedId')
  async deleteFeed(@Req() req, @Param('feedId', ParseIntPipe) feedId: number): Promise<void> {
    return this.feedService.deleteFeed(feedId, req.user.id);
  }

  @ApiOperation({ summary: '피드 댓글 목록' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiPaginatedResponse(GetFeedCommentResponseDto)
  @Get('/:feedId/comment/list')
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
