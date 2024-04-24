import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostFeedRequestDto } from 'src/dto/request/post-feed.request.dto';
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
}
