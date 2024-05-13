import { AuthorizationStatusType } from 'src/entity/common/Enums';
import { GetMyProfileTuple } from 'src/repository/profile.query-repository';

export class GetMyProfileDto {
  nickname!: string;
  generation!: number;
  profileImageUrl!: string;
  introduce!: string;
  followerCount!: number;
  followingCount!: number;
  authorizationStatus!: AuthorizationStatusType;

  constructor(
    nickname: string,
    generation: number,
    profileImageUrl: string,
    introduce: string,
    followerCount: number,
    followingCount: number,
    authorizationStatus: AuthorizationStatusType,
  ) {
    this.nickname = nickname;
    this.generation = generation;
    this.profileImageUrl = profileImageUrl;
    this.introduce = introduce;
    this.followerCount = followerCount;
    this.followingCount = followingCount;
    this.authorizationStatus = authorizationStatus;
  }

  static from(tuple: GetMyProfileTuple) {
    return new GetMyProfileDto(
      tuple.nickname,
      tuple.generation,
      tuple.profileImageUrl,
      tuple.introduce,
      tuple.followerCount,
      tuple.followingCount,
      tuple.authorizationStatus,
    );
  }
}
