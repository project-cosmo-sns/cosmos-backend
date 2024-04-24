import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.decorator';
import { CreatePostInfoDto } from 'src/dto/create-post-dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { PostService } from 'src/service/post.service';

@ApiTags('Post')
@Controller('post')
@UseGuards(RolesGuard)
export class PostController {
  constructor(private readonly postService: PostService) { }

  @ApiOperation({ summary: '포스트 작성' })
  @Post('create')
  async createPost(@Req() req, @Body() createPostInfo: CreatePostInfoDto): Promise<void> {
    return this.postService.createPost(req.user.id, createPostInfo);
  }

}