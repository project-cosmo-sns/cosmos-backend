import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMyProfileImageUrlResponse } from 'src/dto/response/get-my-profile-image-url.response';
import { RolesGuard } from 'src/guard/roles.guard';

@ApiTags('멤버')
@Controller('member')
@UseGuards(RolesGuard)
export class MemberController {
  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({ summary: '로그인 멤버 요약' })
  @ApiResponse({ type: GetMyProfileImageUrlResponse })
  @Get('/summary')
  async getMyProfileImageUrl(@Req() req): Promise<GetMyProfileImageUrlResponse> {
    if (req.user) {
      return GetMyProfileImageUrlResponse.from(true, req.user.profileImageUrl);
    } else {
      return GetMyProfileImageUrlResponse.from(false, undefined);
    }
  }

  @ApiOperation({ summary: '유저 로그아웃' })
  @Post('/logout')
  async handleRedirect(@Res() res) {
    res.clearCookie(this.configService.get('COOKIE_NAME'), { domain: this.configService.get('SESSION_COOKIE_DOMAIN') });
    res.status(200).send();
  }
}
