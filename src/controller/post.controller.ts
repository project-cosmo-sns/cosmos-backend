import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.decorator';
import { PostPostInfoDto } from 'src/dto/post-post-dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { PostService } from 'src/service/post.service';

@ApiTags('Post')
@Controller('post')
@UseGuards(RolesGuard)
export class PostController {
  constructor(private readonly postService: PostService) { }
@Roles('anyone')
  @ApiOperation({ summary: '포스트 작성' })
  @Post('write')
  async writePost(@Req() req, @Body() postPostInfo: PostPostInfoDto): Promise<void> {
    return this.postService.postPost(1, postPostInfo);
  }

}