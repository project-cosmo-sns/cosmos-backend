import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.decorator';
import { GetMemberStatusResponse } from 'src/dto/response/get-member-status.response';
import { GetMyProfileImageUrlResponse } from 'src/dto/response/get-my-profile-image-url.response';
import { AuthorizationStatusType } from 'src/entity/common/Enums';
import { RolesGuard } from 'src/guard/roles.guard';

@ApiTags('멤버')
@Controller('member')
@UseGuards(RolesGuard)
export class MemberController {
  constructor(private readonly configService: ConfigService) {}

  @Roles('anyone')
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

  @Roles('anyone')
  @ApiOperation({ summary: '멤버 상태' })
  @ApiResponse({ type: GetMemberStatusResponse })
  @Get('/status')
  async getMemberStatus(@Req() req): Promise<GetMemberStatusResponse> {
    if (req.user) {
      if (req.user.authorizationStatus === AuthorizationStatusType.ACCEPT) {
        // 로그인 됐고, 승인된 경우
        return GetMemberStatusResponse.from(true, true);
      } else {
        // 로그인 됐고, 승인된 안된 경우
        return GetMemberStatusResponse.from(true, false);
      }
    } else {
      // 로그인 안된 경우
      return GetMemberStatusResponse.from(false, false);
    }
  }

  @ApiOperation({ summary: '유저 로그아웃' })
  @Post('/logout')
  async handleRedirect(@Res() res) {
    res.clearCookie(this.configService.get('COOKIE_NAME'), { domain: this.configService.get('SESSION_COOKIE_DOMAIN') });
    res.status(200).send();
  }
}
