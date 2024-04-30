import { DataSource } from 'typeorm';
import { Injectable } from "@nestjs/common";
import { Follow } from 'src/entity/follow.entity';
import { Member } from 'src/entity/member.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FollowQueryRepository {
  constructor(private readonly dataSource: DataSource) { }

  async getFollowerQuery(memberId: number): Promise<GetFollowTuple[]> {
    const followerListInfo = await this.dataSource
      .createQueryBuilder()
      .from(Follow, 'follow')
      .innerJoin(Member, 'member', 'follow.following_member_id = member.id')
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'member.generation as generation',
        'member.profile_image_url as profileImageUrl'
      ])
      .where('follow.follower_member_id = :memberId', { memberId })
      .getRawMany()
    return plainToInstance(GetFollowTuple, followerListInfo);
  }

}

export class GetFollowTuple {
  memberId!: number;
  nickname!: string;
  generation!: number;
  profileImageUrl!: string;
}
