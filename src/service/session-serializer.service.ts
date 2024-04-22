import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Member } from 'src/entity/member.entity';
import { MemberQueryRepository } from '../repository/member.query-repository';

@Injectable()
export class SessionSerializerService extends PassportSerializer {
  constructor(private readonly memberQueryRepository: MemberQueryRepository) {
    super();
  }

  async serializeUser(member: Member, done: (err: any, user?: any) => void): Promise<any> {
    done(null, member);
  }

  async deserializeUser(payload: Member, done: (err: any, user?: any) => void): Promise<any> {
    const member = await this.memberQueryRepository.getMember(payload.externalId!);
    return done(null, member);
  }
}
