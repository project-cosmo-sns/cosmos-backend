import { ApiProperty } from "@nestjs/swagger";
import { GetFollowerList } from "../get-follower-list";

export class FollowerList {
  @ApiProperty()
  memberId!: number;
  @ApiProperty()
  nickname!: string;
  @ApiProperty()
  generation!: number;
  @ApiProperty()
  profileImageUrl!: string;

  constructor(
    memberId: number,
    nickname: string,
    generation: number,
    profileImageUrl: string
  ) {
    this.memberId = memberId;
    this.nickname = nickname;
    this.generation = generation;
    this.profileImageUrl = profileImageUrl;
  }
}

export class FollowerResponse {
  @ApiProperty({ isArray: true })
  followerInfo: FollowerList;
  constructor(followerInfo: FollowerList) { this.followerInfo = followerInfo; }

  static from(getFollowerLists: GetFollowerList[]) {
    return getFollowerLists.map((followerList) =>
      new FollowerResponse(
        new FollowerList(
          followerList.memberId,
          followerList.nickname,
          followerList.generation,
          followerList.profileImageUrl
        )
      )
    )
  }
}
