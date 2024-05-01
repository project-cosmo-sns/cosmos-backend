import { GoneException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GetOthersProfileDto } from "src/dto/get-others-profile";
import { Member } from "src/entity/member.entity";
import { ProfileQueryRepository } from "src/repository/profile.query-repository";
import { Repository } from "typeorm";

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Member) private readonly memberRepository: Repository<Member>,
    private readonly profileQueryRepository: ProfileQueryRepository
  ) { }

  async getOthersProfileInfo(memberId: number, myMemberId: number): Promise<GetOthersProfileDto> {
    const isDeletedUser = await this.memberRepository.findOneBy({ id: memberId });
    if (isDeletedUser?.deletedAt !== null) {
      throw new GoneException('탈퇴한 유저입니다.');
    }
    const othersProfileInfo = await this.profileQueryRepository.getOthersProfileInfo(memberId, myMemberId);

    return GetOthersProfileDto.from(othersProfileInfo);
  }
}