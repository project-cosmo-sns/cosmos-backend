import { ApiProperty } from '@nestjs/swagger';

export class GetMyProfileImageUrlResponse {
  @ApiProperty()
  isLogin: boolean;
  @ApiProperty()
  profileImageUrl?: string;

  constructor(isLogin, profileImageUrl) {
    this.isLogin = isLogin;
    this.profileImageUrl = profileImageUrl;
  }

  static from(isLogin: boolean, profileImageUrl?: string) {
    return new GetMyProfileImageUrlResponse(isLogin, profileImageUrl);
  }
}
