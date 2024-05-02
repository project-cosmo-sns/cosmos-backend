import { GoneException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GetMyProfileDto } from 'src/dto/get-my-profile';
import { GetOthersProfileDto } from "src/dto/get-others-profile";
import { Member } from "src/entity/member.entity";
import { MemberQueryRepository } from "src/repository/member.query-repository";
import { ProfileQueryRepository } from "src/repository/profile.query-repository";
import { Repository } from "typeorm";

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Member) private readonly memberRepository: Repository<Member>,
    private readonly memberQueryRepository: MemberQueryRepository,
    private readonly profileQueryRepository: ProfileQueryRepository
  ) { }

  async getOthersProfileInfo(memberId: number, myMemberId: number): Promise<GetOthersProfileDto> {
    const isDeletedUser = await this.memberQueryRepository.getMemberIsNotDeletedById(memberId);
    if (!isDeletedUser) {
      throw new GoneException('탈퇴한 유저입니다.');
    }
    const othersProfileInfo = await this.profileQueryRepository.getOthersProfileInfo(memberId, myMemberId);
    const othersFollowerCount = await this.profileQueryRepository.getProfileFollowerCount(memberId);
    const othersFollowingCount = await this.profileQueryRepository.getProfileFollowingCount(memberId);

    othersProfileInfo.followerCount = othersFollowerCount;
    othersProfileInfo.followingCount = othersFollowingCount;

    return GetOthersProfileDto.from(othersProfileInfo);
  }

  async getMyProfileInfo(memberId: number): Promise<GetMyProfileDto> {
    const myProfileInfo = await this.profileQueryRepository.getMyProfileInfo(memberId);
    const myFollowerCount = await this.profileQueryRepository.getProfileFollowerCount(memberId);
    const myFollowingCount = await this.profileQueryRepository.getProfileFollowingCount(memberId);

    myProfileInfo.followerCount = myFollowerCount;
    myProfileInfo.followingCount = myFollowingCount;

    return GetMyProfileDto.from(myProfileInfo);
  }
}