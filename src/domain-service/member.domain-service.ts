import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { MemberQueryRepository } from 'src/repository/member.query-repository';

@Injectable()
export class MemberDomainService {
  constructor(private readonly memberQueryRepository: MemberQueryRepository) { }

  async getMemberIsNotDeletedById(memberId: number) {
    const member = await this.memberQueryRepository.getMemberIsNotDeletedById(memberId);

    if (!member) {
      throw new NotFoundException('해당 회원을 찾을 수 없습니다.');
    }

    return member;
  }

  async getMemberIsAdmin(memberId: number) {
    const member = await this.memberQueryRepository.getMemberIsAdmin(memberId);
    if (!member) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
  }
}
