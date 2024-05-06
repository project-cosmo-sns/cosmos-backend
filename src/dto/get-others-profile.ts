import { GetOthersProfileTuple } from "src/repository/profile.query-repository";

export class GetOthersProfileDto {
  memberId!: number;
  nickname!: string;
  generation!: number;
  profileImageUrl!: string;
  introduce!: string;
  followerCount!: number;
  followingCount!: number;
  isAuthorized!: boolean;
  isFollowed!: boolean;


  constructor(
    memberId: number,
    nickname: string,
    generation: number,
    profileImageUrl: string,
    introduce: string,
    followerCount: number,
    followingCount: number,
    isAuthorized: boolean,
    isFollowed: boolean,
  ) {
    this.memberId = memberId;
    this.nickname = nickname;
    this.generation = generation;
    this.profileImageUrl = profileImageUrl;
    this.introduce = introduce;
    this.followerCount = followerCount;
    this.followingCount = followingCount;
    this.isAuthorized = isAuthorized;
    this.isFollowed = isFollowed;
  }

  static from(tuple: GetOthersProfileTuple) {
    return new GetOthersProfileDto(
      tuple.memberId,
      tuple.nickname,
      tuple.generation,
      tuple.profileImageUrl,
      tuple.introduce,
      tuple.followerCount,
      tuple.followingCount,
      tuple.isAuthorized,
      tuple.isFollowed
    );
  }
}