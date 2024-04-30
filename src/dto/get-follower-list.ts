import { GetFollowTuple } from "src/repository/follow.query-repository";

export class GetFollowerList {
  memberId!: number;
  nickname!: string;
  generation!: number;
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
  static from(tuple: GetFollowTuple) {
    return new GetFollowerList(
      tuple.memberId,
      tuple.nickname,
      tuple.generation,
      tuple.profileImageUrl,
    )
  }
}