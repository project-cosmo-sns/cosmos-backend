import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GithubAuthGuard } from 'src/guard/github-auth.guard';

@ApiTags('OauthLogin')
@Controller('auth')
export class OauthAuthenticationController {
  constructor() {}

  @ApiOperation({ summary: '깃허브 로그인 시도' })
  @Get('/github/login')
  @UseGuards(GithubAuthGuard)
  async handleLogin() {}

  @ApiOperation({ summary: '깃허브 로그인 후 처리' })
  @ApiQuery({ name: 'code', required: true, description: '깃허브 oauth 후 받은 code' })
  @Post('/github/redirect')
  @UseGuards(GithubAuthGuard)
  async handleRedirect() {}
}
