import { Injectable } from "@nestjs/common";
import { GetFollowerList } from "src/dto/get-follower-list";
import { GetFollowingList } from "src/dto/get-following-list";
import { FollowQueryRepository } from "src/repository/follow.query-repository";

@Injectable()
export class FollowService {
  constructor(
    private readonly followQueryRepository: FollowQueryRepository,
  ) { }

  async getFollowerLists(memberId: number) {
    const followerListTuples = await this.followQueryRepository.getFollowerQuery(memberId);
    const followerList = followerListTuples.map((follower) => GetFollowerList.from(follower));
    return followerList;
  }

  async getFollowingLists(memberId: number) {
    const followingListTuples = await this.followQueryRepository.getFollowingQuery(memberId);
    const followingList = followingListTuples.map((following) => GetFollowingList.from(following));
    return followingList;
  }
}