import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMyProfileImageUrlResponse } from 'src/dto/response/get-my-profile-image-url.response';
import { RolesGuard } from 'src/guard/roles.guard';

@ApiTags('멤버')
@Controller('member')
@UseGuards(RolesGuard)
export class MemberController {
  constructor(private readonly configService: ConfigService) { }

  @ApiOperation({ summary: '본인 프로필 이미지' })
  @ApiResponse({ type: GetMyProfileImageUrlResponse })
  @Get('/profile-image-url')
  async getMyProfileImageUrl(@Req() req): Promise<GetMyProfileImageUrlResponse> {
    return GetMyProfileImageUrlResponse.from(req.user.profileImageUrl);
  }

  @ApiOperation({ summary: '유저 로그아웃' })
  @Post('/logout')
  async handleRedirect(@Res() res) {
    res.clearCookie(this.configService.get('COOKIE_NAME'), { domain: this.configService.get('SESSION_COOKIE_DOMAIN') });
    res.status(200).send();
  }
}
