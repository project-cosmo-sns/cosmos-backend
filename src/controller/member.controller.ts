import { Controller, Get, Req } from '@nestjs/common';
import { GetMyProfileImageUrlResponse } from 'src/dto/response/get-my-profile-image-url.response';

@Controller('member')
export class MemberController {
  constructor() {}

  @Get('/profile-image-url')
  async getMyProfileImageUrl(@Req() req): Promise<GetMyProfileImageUrlResponse> {
    return GetMyProfileImageUrlResponse.from(req.user.profileImageUrl);
  }
}
