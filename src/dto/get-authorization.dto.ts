import { GetAuthorizationListTuple } from 'src/repository/authorization.query-repository';

export class GetAuthorizationLists {
  nickname!: string;
  generation!: number;
  imageUrl!: string;
  createdAt!: Date;

  constructor(
    nickname: string,
    generation: number,
    imageUrl: string,
    createdAt: Date
  ) {
    this.nickname = nickname;
    this.generation = generation;
    this.imageUrl = imageUrl;
    this.createdAt = createdAt;
  }

  static from(tuple: GetAuthorizationListTuple) {
    return new GetAuthorizationLists(
      tuple.nickname,
      tuple.generation,
      tuple.imageUrl,
      tuple.createdAt,
    )
  }
}