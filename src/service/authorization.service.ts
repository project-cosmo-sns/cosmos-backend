import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthorizationRequest } from "src/dto/request/authorization.request";
import { Authorization } from "src/entity/authorization.entity";
import { Member } from "src/entity/member.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Member) private readonly memberRepository: Repository<Member>,
    @InjectRepository(Authorization) private readonly authorizationRepository: Repository<Authorization>
  ) { }

  async postAuthorizationInfo(memberId: number, request: AuthorizationRequest): Promise<void> {
    const memberInfo = await this.memberRepository.findOneBy({ id: memberId });
    if (!memberInfo) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }
    if (memberInfo.isAuthorized === true) {
      throw new BadRequestException('이미 승인된 유저입니다.');
    }

    await this.authorizationRepository.save({
      memberId,
      generation: request.generation,
      imageUrl: request.imageUrl
    });
  }
}