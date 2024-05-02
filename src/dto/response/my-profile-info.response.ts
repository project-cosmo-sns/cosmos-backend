import { ApiProperty } from '@nestjs/swagger';
import { GetMyProfileDto } from '../get-my-profile';

export class MyProfileInfoResponse {
  @ApiProperty()
  memberId!: number;
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

  constructor(
    memberId: number,
    nickname: string,
    generation: number,
    profileImageUrl: string,
    introduce: string,
    followerCount: number,
    followingCount: number,
  ) {
    this.memberId = memberId;
    this.nickname = nickname;
    this.generation = generation;
    this.profileImageUrl = profileImageUrl;
    this.introduce = introduce;
    this.followerCount = followerCount;
    this.followingCount = followingCount;
  }

  static from(getMyProfileDto: GetMyProfileDto) {
    return new MyProfileInfoResponse(
      getMyProfileDto.memberId,
      getMyProfileDto.nickname,
      getMyProfileDto.generation,
      getMyProfileDto.profileImageUrl,
      getMyProfileDto.introduce,
      getMyProfileDto.followerCount,
      getMyProfileDto.followingCount,
    )
  }

}