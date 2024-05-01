import { Injectable } from "@nestjs/common";
import { Transform, plainToInstance } from "class-transformer";
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
      .leftJoin(
        Follow,
        'follow',
        'follow.following_member_id = :myMemberId AND follow.follower_member_id = member.id', { myMemberId }
      )
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl',
        'member.introduce as introduce',
        '(SELECT COUNT(*) FROM follow WHERE follow.following_member_id = member.id) AS followingCount',
        '(SELECT COUNT(*) FROM follow WHERE follow.follower_member_id = member.id) AS followerCount',
        'CASE WHEN follow.following_member_id IS NOT NULL THEN true ELSE false END as isFollowed',

      ])
      .where('member.id = :memberId', { memberId })
      .getRawOne()
    if (othersProfile) {
      othersProfile.isFollowed = othersProfile.isFollowed === '1' ? true : false;
    }
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
  isFollowed!: boolean;
}