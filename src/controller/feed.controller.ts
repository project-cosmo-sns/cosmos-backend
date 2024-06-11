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
import { ConfigService } from '@nestjs/config';
import {
  ApiBody,
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
import { PostFeedCommentRequestDto } from 'src/dto/request/post-feed-comment.request';
import { PostFeedRequestDto } from 'src/dto/request/post-feed.request.dto';
import { SortFeedList } from 'src/dto/request/sort-feed-list.request';
import { FeedReplyListResponse } from 'src/dto/response/feed-reply-list.response';
import { GetFeedCommentResponseDto } from 'src/dto/response/get-feed-comment.response.dto';
import { GetFeedDetailResponseDto } from 'src/dto/response/get-feed-detail.response.dto';
import { GetFeedResponseDto } from 'src/dto/response/get-feed.response.dto';
import { ImageResponse } from 'src/dto/response/image.response';
import { RolesGuard } from 'src/guard/roles.guard';
import { FeedCommentService } from 'src/service/feed-comment.service';
import { FeedReplyService } from 'src/service/feed-reply.service';
import { FeedService } from 'src/service/feed.service';
import { ImageService } from 'src/service/image.service';

@ApiTags('피드')
@Controller('feed')
@UseGuards(RolesGuard)
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly feedCommentService: FeedCommentService,
    private readonly feedReplyService: FeedReplyService,
    private readonly imageService: ImageService,
    private readonly configService: ConfigService,
  ) { }

  @ApiOperation({ summary: '피드 작성' })
  @Post('')
  async postFeed(@Req() req, @Body() body: PostFeedRequestDto): Promise<void> {
    return this.feedService.postFeed(req.user.id, body.content, body.imageUrls ?? []);
  }

  @ApiOperation({ summary: '피드 상세' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiResponse({ type: GetFeedDetailResponseDto })
  @Get('/:feedId/detail')
  async getFeedDetail(@Req() req, @Param('feedId', ParseIntPipe) feedId: number): Promise<GetFeedDetailResponseDto> {
    const feed = await this.feedService.getFeedDetail(feedId, req.user.id);

    return feed;
  }

  @ApiOperation({ summary: '피드 수정' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @Patch('/:feedId')
  async patchFeed(
    @Req() req,
    @Body() body: PostFeedRequestDto,
    @Param('feedId', ParseIntPipe) feedId: number,
  ): Promise<void> {
    return this.feedService.patchFeed(req.user.id, feedId, body.content, body.imageUrls ?? []);
  }

  @ApiOperation({ summary: '피드 삭제' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @Delete(':feedId')
  async deleteFeed(@Req() req, @Param('feedId', ParseIntPipe) feedId: number): Promise<void> {
    return this.feedService.deleteFeed(feedId, req.user.id);
  }

  @Roles('anyone')
  @ApiOperation({ summary: '피드 목록' })
  @ApiPaginatedResponse(GetFeedResponseDto)
  @Get('/list')
  async getFeedList(
    @Req() req,
    @Query() sortFeedList: SortFeedList
  ): Promise<PaginationResponse<GetFeedResponseDto>> {
    const userId = req.user?.id;
    const userGeneration = req.user?.generation;
    const { feedList, totalCount } = await this.feedService.getFeedList(sortFeedList, userId, userGeneration);

    return PaginationResponse.of({
      data: feedList,
      options: sortFeedList,
      totalCount,
    });
  }

  @ApiOperation({ summary: '피드 이모지 추가' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiGoneResponse({ status: 410, description: '피드가 삭제되었을 경우' })
  @ApiBody({ description: '이모지 정보', schema: { type: 'object', properties: { emoji: { type: 'string' } } } })
  @Post(':feedId/emoji')
  async createPostEmoji(
    @Req() req,
    @Param('feedId', ParseIntPipe) feedId: number,
    @Body('emoji') emoji: string,
  ): Promise<void> {
    return this.feedService.postFeedEmoji(feedId, req.user.id, emoji);
  }

  @ApiOperation({ summary: '피드 이모지 삭제' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiParam({ name: 'emojiCode', required: true, description: '피드 이모지 코드' })
  @ApiUnauthorizedResponse({ status: 401, description: '해당 이모지를 추가한 유저가 아닐 경우' })
  @ApiGoneResponse({ status: 410, description: '피드가 삭제되었을 경우' })
  @Delete(':feedId/emoji/:emojiCode')
  async deletePostEmoji(
    @Req() req,
    @Param('feedId', ParseIntPipe) feedId: number,
    @Param('emojiCode') emojiCode: string,
  ): Promise<void> {
    return this.feedService.deleteFeedEmoji(feedId, req.user.id, emojiCode);
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
    @Body() body: PostFeedCommentRequestDto,
  ): Promise<void> {
    return this.feedCommentService.postFeedComment(feedId, req.user.id, body.content);
  }

  @ApiOperation({ summary: '피드 댓글 수정' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiParam({ name: 'commentId', required: true, description: '피드 댓글 id' })
  @ApiUnauthorizedResponse({ status: 401, description: '해당 댓글을 작성한 사람이 아닐 경우' })
  @ApiGoneResponse({ status: 410, description: '피드가 삭제되었거나, 댓글이 삭제된 경우' })
  @ApiBody({ description: '댓글 내용', schema: { type: 'object', properties: { content: { type: 'string' } } } })
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

  @ApiOperation({ summary: '피드 이미지 url 불러오기' })
  @Get('/image/create')
  async createUploadURL(): Promise<ImageResponse> {
    const bucket = this.configService.get('AWS_S3_UPLOAD_BUCKET_FEED');

    const uploadUrl = await this.imageService.createUploadURL(bucket);
    return new ImageResponse(uploadUrl);
  }

  @ApiOperation({ summary: '피드 이미지 삭제' })
  @ApiParam({ name: 'imageUrls', required: true, description: '이미지 urls' })
  @Delete('/image/delete')
  async deleteImage(@Query('imageUrls') imageUrls: string[]): Promise<void> {
    const bucket = this.configService.get('AWS_S3_UPLOAD_BUCKET_FEED');

    await this.imageService.deleteImage(imageUrls, bucket);
  }

  @ApiOperation({ summary: '피드 대댓글 쓰기' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiParam({ name: 'commentId', required: true, description: '댓글 id' })
  @ApiBody({ description: '대댓글 내용', schema: { type: 'object', properties: { content: { type: 'string' } } } })
  @Post(':feedId/comment/:commentId/write')
  async writeFeedReply(
    @Param('feedId', ParseIntPipe) feedId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
    @Body('content') content: string,
  ): Promise<void> {
    return this.feedReplyService.writeFeedReply(feedId, commentId, req.user.id, content);
  }

  @ApiOperation({ summary: '피드 대댓글 수정' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiParam({ name: 'replyId', required: true, description: '피드 대댓글 id' })
  @ApiBody({ description: '대댓글 내용', schema: { type: 'object', properties: { content: { type: 'string' } } } })
  @Patch(':feedId/reply/:replyId/modify')
  async modifyFeedReply(
    @Param('feedId', ParseIntPipe) feedId: number,
    @Param('replyId', ParseIntPipe) replyId: number,
    @Req() req,
    @Body('content') content: string,
  ): Promise<void> {
    return this.feedReplyService.patchFeedReply(feedId, replyId, req.user.id, content);
  }

  @ApiOperation({ summary: '피드 대댓글 삭제' })
  @ApiParam({ name: 'feedId', required: true, description: '피드 id' })
  @ApiParam({ name: 'replyId', required: true, description: '피드 대댓글 id' })
  @Delete(':feedId/reply/:replyId/')
  async removeFeedReply(
    @Param('feedId', ParseIntPipe) feedId: number,
    @Param('replyId', ParseIntPipe) replyId: number,
    @Req() req,
  ): Promise<void> {
    return this.feedReplyService.deleteFeedReply(feedId, replyId, req.user.id);
  }

  @ApiOperation({ summary: '피드 대댓글 조회' })
  @ApiParam({ name: 'commentId', required: true, description: '피드 댓글 id' })
  @Get('comment/:commentId/reply')
  async viewFeedReply(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
    @Query() PaginationRequest: PaginationRequest,
  ): Promise<PaginationResponse<FeedReplyListResponse>> {
    const { feedReplyInfo, totalCount } = await this.feedReplyService.getFeedReplyList(
      commentId,
      req.user.id,
      PaginationRequest,
    )
    const feedReplyData = feedReplyInfo.map((info) => FeedReplyListResponse.from(info));
    return PaginationResponse.of({
      data: feedReplyData,
      options: PaginationRequest,
      totalCount,
    });
  }
}
