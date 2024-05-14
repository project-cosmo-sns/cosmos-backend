import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { MemberDomainService } from 'src/domain-service/member.domain-service';
import { GetAuthorizationLists } from 'src/dto/get-authorization.dto';
import { AuthorizationRequest } from 'src/dto/request/authorization.request';
import { Authorization } from 'src/entity/authorization.entity';
import { AuthorizationStatusType } from 'src/entity/common/Enums';
import { Member } from 'src/entity/member.entity';
import { AuthorizationQueryRepository } from 'src/repository/authorization.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Authorization) private readonly authorizationRepository: Repository<Authorization>,
    @InjectRepository(Member) private readonly memberRepository: Repository<Member>,
    private readonly memberDomainService: MemberDomainService,
    private readonly authorizationQueryRepository: AuthorizationQueryRepository,
  ) { }

  async postAuthorizationInfo(memberId: number, request: AuthorizationRequest): Promise<void> {
    const memberInfo = await this.memberDomainService.getMemberIsNotDeletedById(memberId);

    if (memberInfo.authorizationStatus === AuthorizationStatusType.ACCEPT) {
      throw new BadRequestException('이미 승인된 유저입니다.');
    }
    if (memberInfo.authorizationStatus === AuthorizationStatusType.PENDING) {
      throw new BadRequestException('승인 대기중입니다.');
    }

    const authorizationInfo = await this.authorizationRepository.findOneBy({ memberId });
    if (authorizationInfo) {
      throw new BadRequestException('인증 대기중입니다.');
    }

    memberInfo.setAuthorizationPending();
    await this.memberRepository.save(memberInfo);

    await this.authorizationRepository.save({
      memberId,
      generation: request.generation,
      imageUrl: request.imageUrl,
    });
  }

  async getAuthorizationList(memberId: number, request: PaginationRequest) {
    await this.memberDomainService.getMemberIsAdmin(memberId);
    const authorizationLists = await this.authorizationQueryRepository.getAuthorizationList(request);
    const totalCount = await this.authorizationQueryRepository.getAuthorizationListCount();

    const authorizationInfo = authorizationLists.map((list) => {
      return GetAuthorizationLists.from(list);
    });

    return { authorizationInfo, totalCount };
  }

  async acceptAuthorization(adminId: number, memberId: number) {
    await this.memberDomainService.getMemberIsAdmin(adminId);

    const memberInfo = await this.memberDomainService.getMemberIsNotDeletedById(memberId);

    if (memberInfo.authorizationStatus === AuthorizationStatusType.ACCEPT) {
      throw new NotFoundException('이미 인증된 사용자입니다.');
    }

    const authorizedMemberInfo = await this.authorizationRepository.findOneBy({ memberId });

    if (!authorizedMemberInfo) {
      throw new NotFoundException('해당 인증을 찾을 수 없습니다.');
    }

    memberInfo.setAuthorizationAccept(authorizedMemberInfo.generation);
    await this.memberRepository.save(memberInfo);

    authorizedMemberInfo.setIsChecked();
    await this.authorizationRepository.save(authorizedMemberInfo);
  }

  async declineAuthorization(adminId: number, memberId: number) {
    await this.memberDomainService.getMemberIsAdmin(adminId);

    const memberInfo = await this.memberDomainService.getMemberIsNotDeletedById(memberId);

    if (memberInfo.authorizationStatus === AuthorizationStatusType.ACCEPT) {
      throw new NotFoundException('이미 인증된 사용자입니다.');
    }

    memberInfo.setAuthorizationDecline();

    await this.memberRepository.save(memberInfo);

    const authorizedMemberInfo = await this.authorizationRepository.findOneBy({ memberId });
    if (!authorizedMemberInfo) {
      throw new NotFoundException('해당 인증을 찾을 수 없습니다.');
    }

    authorizedMemberInfo.setIsChecked();

    await this.authorizationRepository.save(authorizedMemberInfo);
  }
}
