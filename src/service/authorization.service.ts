import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MemberDomainService } from 'src/domain-service/member.domain-service';
import { AuthorizationRequest } from "src/dto/request/authorization.request";
import { Authorization } from "src/entity/authorization.entity";
import { Member } from "src/entity/member.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Authorization) private readonly authorizationRepository: Repository<Authorization>,
    private readonly memberDomainService: MemberDomainService,
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
}