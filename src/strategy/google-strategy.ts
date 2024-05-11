import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { SocialLoginDto } from 'src/dto/socialLoginDto';
import { SocialProvider } from 'src/entity/common/SocialProvider';
import { OauthAuthenticationService } from 'src/service/oauth-authentication.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly googleAuthService: OauthAuthenticationService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: [process.env.GOOGLE_SCOPE_PROFILE, process.env.GOOGLE_SCOPE_EMAIL],
    });
  }

  // refreshToken은 사용하지 않아도 매개변수 순서때문에 지우면 안됨.
  async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback): Promise<void> {
    const { id, displayName, username } = profile;

    const socialLoginInfo: SocialLoginDto = {
      nickname: displayName ?? username,
      socialProvider: SocialProvider.GOOGLE,
      externalId: id,
    };

    try {
      const member = await this.googleAuthService.validateAndSaveUser(socialLoginInfo);
      done(null, member, accessToken);
    } catch (err) {
      done(err, false);
    }
  }
}
