import { GetAuthorizationListTuple } from 'src/repository/authorization.query-repository';

export class GetAuthorizationLists {
  memberId!: number;
  nickname!: string;
  realName!: string;
  generation!: number;
  imageUrl!: string;
  createdAt!: Date;

  constructor(
    memberId: number,
    nickname: string,
    realName: string,
    generation: number,
    imageUrl: string,
    createdAt: Date
  ) {
    this.memberId = memberId;
    this.nickname = nickname;
    this.realName = realName;
    this.generation = generation;
    this.imageUrl = imageUrl;
    this.createdAt = createdAt;
  }

  static from(tuple: GetAuthorizationListTuple) {
    return new GetAuthorizationLists(
      tuple.memberId,
      tuple.nickname,
      tuple.realName,
      tuple.generation,
      tuple.imageUrl,
      tuple.createdAt,
    )
  }
}