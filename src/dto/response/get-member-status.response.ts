import { ApiProperty } from '@nestjs/swagger';

export class GetMemberStatusResponse {
  @ApiProperty()
  isLogin: boolean;
  @ApiProperty()
  isAuthorized: boolean;

  constructor(isLogin, isAuthorized) {
    this.isLogin = isLogin;
    this.isAuthorized = isAuthorized;
  }

  static from(isLogin: boolean, isAuthorized: boolean) {
    return new GetMemberStatusResponse(isLogin, isAuthorized);
  }
}
