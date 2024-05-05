import { ApiProperty } from '@nestjs/swagger';
import { GetMyProfileDto } from '../get-my-profile';

export class MyProfileInfoResponse {
  @ApiProperty()
  nickname!: string;
  @ApiProperty()
  generation!: number;
  @ApiProperty()
  profileImageUrl!: string;
  @ApiProperty()
  introduce!: string;
  @ApiProperty()
  followerCount!: number;
  @ApiProperty()
  followingCount!: number;
  @ApiProperty()
  isAuthorized!: boolean;

  constructor(
    nickname: string,
    generation: number,
    profileImageUrl: string,
    introduce: string,
    followerCount: number,
    followingCount: number,
    isAuthorized: boolean,
  ) {
    this.nickname = nickname;
    this.generation = generation;
    this.profileImageUrl = profileImageUrl;
    this.introduce = introduce;
    this.followerCount = followerCount;
    this.followingCount = followingCount;
    this.isAuthorized = isAuthorized;
  }

  static from(getMyProfileDto: GetMyProfileDto) {
    return new MyProfileInfoResponse(
      getMyProfileDto.nickname,
      getMyProfileDto.generation,
      getMyProfileDto.profileImageUrl,
      getMyProfileDto.introduce,
      getMyProfileDto.followerCount,
      getMyProfileDto.followingCount,
      getMyProfileDto.isAuthorized,
    );
  }
}
