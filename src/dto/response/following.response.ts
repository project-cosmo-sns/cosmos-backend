import { ApiProperty } from "@nestjs/swagger";
import { GetFollowingList } from "../get-following-list";

export class FollowingList {
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

export class FollowingResponse {
  @ApiProperty({ isArray: true })
  followingInfo: FollowingList;
  constructor(followingInfo: FollowingList) { this.followingInfo = followingInfo; }

  static from(getFollowingLists: GetFollowingList[]) {
    return getFollowingLists.map((followingList) =>
      new FollowingResponse(
        new FollowingList(
          followingList.memberId,
          followingList.nickname,
          followingList.generation,
          followingList.profileImageUrl
        )
      )
    )
  }
}
