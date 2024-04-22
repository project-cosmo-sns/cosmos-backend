import { IsEnum, IsString } from 'class-validator';
import { SocialProvider } from 'src/entity/common/SocialProvider';

export class SocialLoginDto {
  @IsString()
  nickname: string;

  @IsString()
  profileImageUrl: string;

  @IsEnum(SocialProvider)
  socialProvider: SocialProvider;

  @IsString()
  externalId: string;
}
