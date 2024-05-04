import { ApiProperty } from '@nestjs/swagger';

export class GetMyProfileImageUrlResponse {
  @ApiProperty()
  profileImageUrl?: string;

  constructor(profileImageUrl) {
    this.profileImageUrl = profileImageUrl;
  }

  static from(profileImageUrl: string) {
    return new GetMyProfileImageUrlResponse(profileImageUrl);
  }
}
