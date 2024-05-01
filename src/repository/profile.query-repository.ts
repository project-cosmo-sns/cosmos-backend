import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { Follow } from "src/entity/follow.entity";
import { Member } from "src/entity/member.entity";
import { DataSource } from "typeorm";

@Injectable()
export class ProfileQueryRepository {
  constructor(private readonly dataSource: DataSource) { }

  async getOthersProfileInfo(memberId: number, myMemberId: number): Promise<GetOthersProfileTuple> {
    const othersProfile = await this.dataSource
      .createQueryBuilder()
      .from(Member, 'member')
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
        'member.introduce as introduce',
        '(SELECT COUNT(*) FROM follow WHERE follow.following_member_id = member.id) AS followerCount',
        '(SELECT COUNT(*) FROM follow WHERE follow.follower_member_id = member.id) AS followingCount'

      ])
      .where('member.id = :memberId', { memberId })
      .getRawOne()
    return plainToInstance(GetOthersProfileTuple, othersProfile);
  }
}

export class GetOthersProfileTuple {
  memberId!: number;
  nickname!: string;
  generation!: number;
  profileImageUrl!: string;
  introduce!: string;
  followerCount!: number;
  followingCount!: number;
}