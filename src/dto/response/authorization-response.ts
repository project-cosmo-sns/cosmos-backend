import { ApiProperty } from '@nestjs/swagger';
import { GetAuthorizationLists } from '../get-authorization.dto';

export class AuthorizationResponse {
  @ApiProperty()
  memberId!: number;
  @ApiProperty()
  nickname!: string;
  @ApiProperty()
  generation!: number;
  @ApiProperty()
  imageUrl!: string;
  @ApiProperty()
  createdAt!: Date;

  constructor(
    memberId: number,
    nickname: string,
    generation: number,
    imageUrl: string,
    createdAt: Date,
  ) {
    this.memberId = memberId;
    this.nickname = nickname;
    this.generation = generation;
    this.imageUrl = imageUrl;
    this.createdAt = createdAt;
  }

  static from(dto: GetAuthorizationLists[]) {
    return dto.map(
      (getAuthorizationLists) =>
        new AuthorizationResponse(
          getAuthorizationLists.memberId,
          getAuthorizationLists.nickname,
          getAuthorizationLists.generation,
          getAuthorizationLists.imageUrl,
          getAuthorizationLists.createdAt,
        )
    )
  }
}