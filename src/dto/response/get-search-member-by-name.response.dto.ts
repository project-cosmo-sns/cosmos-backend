import { ApiProperty } from '@nestjs/swagger';

class MemberDto {
  @ApiProperty()
  id!: number;
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
  @ApiProperty()
  isFollowing!: boolean;
  @ApiProperty()
  isMine!: boolean;
}

export class GetSearchMemberByNameResponseDto {
  @ApiProperty({ type: MemberDto })
  member: MemberDto;

  constructor(member: MemberDto) {
    this.member = member;
  }

  static from({ member }: { member: MemberDto }) {
    return new GetSearchMemberByNameResponseDto(member);
  }
}
