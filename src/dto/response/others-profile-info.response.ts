import { ApiProperty } from "@nestjs/swagger";
import { GetOthersProfileDto } from "../get-others-profile";

export class OthersProfileInfoResponse {
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
    followingCount: number
  ) {
    this.memberId = memberId;
    this.nickname = nickname;
    this.generation = generation;
    this.profileImageUrl = profileImageUrl;
    this.introduce = introduce;
    this.followerCount = followerCount;
    this.followingCount = followingCount;
  }

  static from(getOthersProfileDto: GetOthersProfileDto) {
    return new OthersProfileInfoResponse(
      getOthersProfileDto.memberId,
      getOthersProfileDto.nickname,
      getOthersProfileDto.generation,
      getOthersProfileDto.profileImageUrl,
      getOthersProfileDto.introduce,
      getOthersProfileDto.followerCount,
      getOthersProfileDto.followingCount
    )
  }

}