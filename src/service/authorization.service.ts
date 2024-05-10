import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { MemberDomainService } from 'src/domain-service/member.domain-service';
import { GetAuthorizationLists } from 'src/dto/get-authorization.dto';
import { AuthorizationRequest } from "src/dto/request/authorization.request";
import { Authorization } from "src/entity/authorization.entity";
import { AuthorizationQueryRepository } from 'src/repository/authorization.query-repository';
import { Repository } from "typeorm";

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Authorization) private readonly authorizationRepository: Repository<Authorization>,
    private readonly memberDomainService: MemberDomainService,
    private readonly authorizationQueryRepository: AuthorizationQueryRepository,
  ) { }

  async postAuthorizationInfo(memberId: number, request: AuthorizationRequest): Promise<void> {
    const memberInfo = await this.memberDomainService.getMemberIsNotDeletedById(memberId);
    if (memberInfo.isAuthorized === true) {
      throw new BadRequestException('이미 승인된 유저입니다.');
    }

    const authorizationInfo = await this.authorizationRepository.findOneBy({ memberId });
    if (authorizationInfo) {
      throw new BadRequestException('인증 대기중입니다.');
    }

    await this.authorizationRepository.save({
      memberId,
      generation: request.generation,
      imageUrl: request.imageUrl
    });
  }

  async getAuthorizationList(memberId: number, request: PaginationRequest) {
    if (!(memberId === 1 || (memberId >= 3 && memberId <= 8) || memberId === 21)) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
    const authorizationLists = await this.authorizationQueryRepository.getAuthorizationList(request);
    const totalCount = await this.authorizationQueryRepository.getAuthorizationListCount();

    const authorizationInfo = authorizationLists.map((list) => {
      return GetAuthorizationLists.from(list);
    })

    return { authorizationInfo, totalCount };
  }
}