import {
  Body,
  Controller,
  Delete,
  Get,
  GoneException,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiGoneResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

  @ApiOperation({ summary: '피드 이모지 추가' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiGoneResponse({ status: 410, description: '피드가 삭제되었을 경우' })
  @Post(':feedId/emoji')
  async createPostEmoji(
    @Req() req,
    @Param('feedId', ParseIntPipe) feedId: number,
    @Body('emoji') emoji: string,
  ): Promise<void> {
    return this.feedService.postFeedEmoji(feedId, req.user.id, emoji);
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

  @ApiOperation({ summary: '피드 댓글 작성' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @Post(':feedId/comment')
  async postFeedComment(
    @Param('feedId', ParseIntPipe) feedId: number,
    @Req() req,
    @Body('content') content: string,
  ): Promise<void> {
    return this.feedCommentService.postFeedComment(feedId, req.user.id, content);
  }

  @ApiOperation({ summary: '피드 댓글 수정' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiParam({ name: 'commentId', required: true, description: '피드 댓글 id' })
  @ApiUnauthorizedResponse({ status: 401, description: '해당 댓글을 작성한 사람이 아닐 경우' })
  @ApiGoneResponse({ status: 410, description: '피드가 삭제되었거나, 댓글이 삭제된 경우' })
  @Patch(':feedId/comment/:commentId')
  async patchFeedComment(
    @Param('feedId', ParseIntPipe) feedId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
    @Body('content') content: string,
  ): Promise<void> {
    try {
      return this.feedCommentService.patchFeedComment(feedId, commentId, req.user.id, content);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof GoneException) {
        throw error;
      } else {
        throw new InternalServerErrorException('서버 오류가 발생했습니다.');
      }
    }
  }

  @ApiOperation({ summary: '피드 댓글 삭제' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiParam({ name: 'commentId', required: true, description: '피드 댓글 id' })
  @ApiUnauthorizedResponse({ status: 401, description: '해당 댓글을 작성한 사람이 아닐 경우' })
  @ApiGoneResponse({ status: 410, description: '피드가 삭제되었거나, 댓글이 삭제된 경우' })
  @Delete(':feedId/comment/:commentId')
  async deleteFeedComment(
    @Param('feedId', ParseIntPipe) feedId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
  ): Promise<void> {
    try {
      return this.feedCommentService.deleteFeedComment(feedId, commentId, req.user.id);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof GoneException) {
        throw error;
      } else {
        throw new InternalServerErrorException('서버 오류가 발생했습니다.');
      }
    }
  }

  @ApiOperation({ summary: '피드 댓글 좋아요' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiParam({ name: 'commentId', required: true, description: '피드 댓글 id' })
  @ApiGoneResponse({ status: 410, description: '피드가 삭제되었거나, 댓글이 삭제된 경우' })
  @Post(':feedId/comment/:commentId/like')
  async likeFeedComment(
    @Param('feedId', ParseIntPipe) feedId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
  ): Promise<void> {
    try {
      return this.feedCommentService.likeFeedComment(feedId, commentId, req.user.id);
    } catch (error) {
      if (error instanceof GoneException) {
        throw error;
      } else {
        throw new InternalServerErrorException('서버 오류가 발생했습니다.');
      }
    }
  }

  @ApiOperation({ summary: '피드 댓글 좋아요 취소' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiParam({ name: 'commentId', required: true, description: '피드 댓글 id' })
  @ApiUnauthorizedResponse({ status: 401, description: '해당 댓글 좋아요를 누른 사람이 아닐 경우' })
  @ApiGoneResponse({ status: 410, description: '피드가 삭제되었거나, 댓글이 삭제된 경우' })
  @Delete(':feedId/comment/:commentId/like')
  async removePostCommentHeart(
    @Param('feedId', ParseIntPipe) feedId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
  ): Promise<void> {
    try {
      return this.feedCommentService.unlikeFeedComment(feedId, commentId, req.user.id);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof GoneException) {
        throw error;
      } else {
        throw new InternalServerErrorException('서버 오류가 발생했습니다.');
      }
    }
  }
}
