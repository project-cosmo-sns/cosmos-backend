import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMyProfileImageUrlResponse } from 'src/dto/response/get-my-profile-image-url.response';
import { RolesGuard } from 'src/guard/roles.guard';

@ApiTags('멤버')
@Controller('member')
@UseGuards(RolesGuard)
export class MemberController {
  constructor() {}

  @ApiOperation({ summary: '본인 프로필 이미지' })
  @ApiResponse({ type: GetMyProfileImageUrlResponse })
  @Get('/profile-image-url')
  async getMyProfileImageUrl(@Req() req): Promise<GetMyProfileImageUrlResponse> {
    return GetMyProfileImageUrlResponse.from(req.user.profileImageUrl);
  }
}
