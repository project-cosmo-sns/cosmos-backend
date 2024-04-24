import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { ApiPaginatedResponse } from 'src/common/pagination/pagination.decorator';
import { PostFeedRequestDto } from 'src/dto/request/post-feed.request.dto';
import { GetFeedListResponseDto } from 'src/dto/response/get-feed-list.response.dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { FeedService } from 'src/service/feed.service';

@ApiTags('피드')
@Controller('feed')
@UseGuards(RolesGuard)
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    // private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: '피드 작성' })
  @Post('')
  async postFeed(@Req() req, @Body() body: PostFeedRequestDto): Promise<void> {
    return this.feedService.postFeed(req.user.id, body.content);
  }

  @ApiOperation({ summary: '피드 목록' })
  @ApiPaginatedResponse(GetFeedListResponseDto)
  @Get('/list')
  async getFeedList(
    @Query() paginationRequest: PaginationRequest,
  ): Promise<PaginationResponse<GetFeedListResponseDto>> {
    const { feedList, totalCount } = await this.feedService.getFeedList(paginationRequest);

    return PaginationResponse.of({
      data: feedList,
      options: paginationRequest,
      totalCount,
    });
  }
}
