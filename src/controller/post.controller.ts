import {
  Body,
  Controller,
  Delete,
  Get,
  GoneException,
  InternalServerErrorException,
  NotFoundException,
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
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { ApiPaginatedResponse } from 'src/common/pagination/pagination.decorator';
import { Roles } from 'src/common/roles/roles.decorator';
import { CreatePostInfoDto } from 'src/dto/request/create-post-dto';
import { DeleteImageRequestDto } from 'src/dto/request/delete-image.request.dto';
import { HashTagSearchRequest } from 'src/dto/request/hash-tag-search.request';
import { SortPostList } from 'src/dto/request/sort-post-list.request';
import { CreatePostResponse } from 'src/dto/response/create-post.response';
import { HashTagSearchResponse } from 'src/dto/response/hash-tag-search.response';
import { ImageResponse } from 'src/dto/response/image.response';
import { PostCommentListResponse } from 'src/dto/response/post-comment-list.response';
import { PostDetailResponse } from 'src/dto/response/post-detail.response';
import { PostListResponse } from 'src/dto/response/post-list.response';
import { RolesGuard } from 'src/guard/roles.guard';
import { ImageService } from 'src/service/image.service';
import { PostService } from 'src/service/post.service';

@ApiTags('포스트')
@Controller('post')
@UseGuards(RolesGuard)
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly imageService: ImageService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: '포스트 작성' })
  @ApiResponse({ type: CreatePostResponse })
  @Post('create')
  async createPost(@Req() req, @Body() createPostInfo: CreatePostInfoDto): Promise<CreatePostResponse> {
    return await this.postService.createPost(req.user.id, createPostInfo);
  }

  @Roles('anyone')
  @ApiOperation({ summary: '포스트 목록' })
  @ApiPaginatedResponse(PostListResponse)
  @ApiResponse({ status: 401, description: '로그인 하지 않고 [기수순, 팔로우순]으로 정렬했을 경우' })
  @Get('list')
  async getPostList(@Req() req, @Query() sortPostList: SortPostList): Promise<PaginationResponse<PostListResponse>> {
    const userId = req.user?.id;
    const userGeneration = req.user?.generation;
    try {
      const { postInfo, totalCount } = await this.postService.getPostList(userId, userGeneration, sortPostList);
      const postData = postInfo.map((info) => PostListResponse.from(info));
      return PaginationResponse.of({
        data: postData,
        options: sortPostList,
        totalCount,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
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

  @ApiOperation({ summary: '포스트 수정' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @ApiNotFoundResponse({ status: 404, description: '해당 postId값을 가진 포스트가 없거나 삭제된 경우' })
  @ApiUnauthorizedResponse({ status: 401, description: '포스트 쓴 유저가 아닐 경우' })
  @Patch(':postId')
  async modifyPostInfo(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req,
    @Body() createPostInfo: CreatePostInfoDto,
  ): Promise<void> {
    return await this.postService.modifyPost(postId, req.user.id, createPostInfo);
  }

  @ApiOperation({ summary: '포스트 삭제' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @Delete(':postId')
  async deletePostInfo(@Req() req, @Param('postId', ParseIntPipe) postId: number): Promise<void> {
    return this.postService.deletePost(postId, req.user.id);
  }

  @ApiOperation({ summary: '포스트 이모지 추가' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @ApiGoneResponse({ status: 410, description: '포스트가 삭제되었을 경우' })
  @ApiBody({ description: '이모지 정보', schema: { type: 'object', properties: { emoji: { type: 'string' } } } })
  @Post(':postId/emoji')
  async createPostEmoji(
    @Req() req,
    @Param('postId', ParseIntPipe) postId: number,
    @Body('emoji') emoji: string,
  ): Promise<void> {
    return this.postService.createPostEmoji(postId, req.user.id, emoji);
  }

  @ApiOperation({ summary: '포스트 이모지 삭제' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @ApiParam({ name: 'emojiId', required: true, description: '포스트 이모지 id' })
  @ApiUnauthorizedResponse({ status: 401, description: '해당 이모지를 추가한 유저가 아닐 경우' })
  @ApiGoneResponse({ status: 410, description: '포스트가 삭제되었을 경우' })
  @Delete(':postId/emoji/:emojiId')
  async deletePostEmoji(
    @Req() req,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('emojiId', ParseIntPipe) emojiId: number,
  ): Promise<void> {
    return this.postService.removePostEmoji(postId, req.user.id, emojiId);
  }

  @Roles('anyone')
  @ApiOperation({ summary: '포스트 조회수 증가' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @Post(':postId/view-count/increase')
  async increasePostViewCount(@Req() req, @Param('postId', ParseIntPipe) postId: number): Promise<void> {
    const userId = req.user?.id;
    return this.postService.increasePostViewCount(postId, userId);
  }

  @ApiOperation({ summary: '포스트 댓글 목록' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @ApiPaginatedResponse(PostCommentListResponse)
  @Get(':postId/comment/list')
  async getPostCommentList(
    @Req() req,
    @Query() paginationRequest: PaginationRequest,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<PaginationResponse<PostCommentListResponse>> {
    const { postCommentInfo, totalCount } = await this.postService.getPostCommentList(
      postId,
      req.user.id,
      paginationRequest,
    );
    const postCommentData = postCommentInfo.map((info) => PostCommentListResponse.from(info));
    return PaginationResponse.of({
      data: postCommentData,
      options: paginationRequest,
      totalCount,
    });
  }

  @ApiOperation({ summary: '포스트 댓글 쓰기' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @ApiBody({ description: '댓글 내용', schema: { type: 'object', properties: { content: { type: 'string' } } } })
  @Post(':postId/comment/write')
  async writePostComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req,
    @Body('content') content: string,
  ): Promise<void> {
    return this.postService.writePostComment(postId, req.user.id, content);
  }

  @ApiOperation({ summary: '포스트 댓글 수정' })
  @ApiParam({ name: 'postId', required: true, description: '포스트 id' })
  @ApiParam({ name: 'commentId', required: true, description: '포스트 댓글 id' })
  @ApiUnauthorizedResponse({ status: 401, description: '해당 댓글을 작성한 사람이 아닐 경우' })
  @ApiGoneResponse({ status: 410, description: '포스트가 삭제되었거나, 댓글이 삭제된 경우' })
  @ApiBody({ description: '댓글 내용', schema: { type: 'object', properties: { content: { type: 'string' } } } })
  @Patch(':postId/comment/:commentId/modify')
  async modifyPostComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
    @Body('content') content: string,
  ): Promise<void> {
    try {
      return this.postService.patchPostComment(postId, commentId, req.user.id, content);
    } catch (error) {
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
  @Delete(':postId/comment/:commentId')
  async removePostComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
  ): Promise<void> {
    try {
      return this.postService.deletePostComment(postId, commentId, req.user.id);
    } catch (error) {
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
  @Post(':postId/comment/:commentId/like')
  async likePostComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
  ): Promise<void> {
    try {
      return this.postService.heartPostComment(postId, commentId, req.user.id);
    } catch (error) {
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
  @Delete(':postId/comment/:commentId/like')
  async removePostCommentHeart(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req,
  ): Promise<void> {
    try {
      return this.postService.deletePostCommentHeart(postId, commentId, req.user.id);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof GoneException) {
        throw error;
      } else {
        throw new InternalServerErrorException('서버 오류가 발생했습니다.');
      }
    }
  }

  @ApiOperation({ summary: '해시태그 검색' })
  @ApiResponse({ type: HashTagSearchResponse })
  @Get('search/hashTag')
  async searchHashTag(@Query() hashTagSearchRequest: HashTagSearchRequest): Promise<HashTagSearchResponse[]> {
    const hashTagSearchResult = await this.postService.getHashTagSearchInfo(hashTagSearchRequest);
    return HashTagSearchResponse.from(hashTagSearchResult);
  }

  @ApiOperation({ summary: '이미지 url 불러오기' })
  @Post('/image')
  async createUploadURL(): Promise<ImageResponse> {
    const bucket = this.configService.get('AWS_S3_UPLOAD_BUCKET_POST');

    const uploadUrl = await this.imageService.createUploadURL(bucket);
    return new ImageResponse(uploadUrl);
  }
}
