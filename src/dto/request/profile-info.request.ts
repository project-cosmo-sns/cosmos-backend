import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class profileInfoRequestDto {
  @ApiProperty()
  @IsString()
  nickname!: string;

  @ApiProperty()
  @IsString()
  profileImageUrl!: string;

  @ApiProperty()
  @IsString()
  introduce!: string;

  constructor(nickname: string, profileImageUrl: string, introduce: string) {
    this.nickname = nickname;
    this.profileImageUrl = profileImageUrl;
    this.introduce = introduce;
  }
}