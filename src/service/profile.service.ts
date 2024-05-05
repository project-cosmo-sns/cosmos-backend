import { GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { GetMyProfileDto } from 'src/dto/get-my-profile';
import { GetOthersProfileDto } from 'src/dto/get-others-profile';
import { GetPostList, GetPostListDto } from 'src/dto/get-post-list.dto';
import { profileInfoRequestDto } from 'src/dto/request/profile-info.request';
import { GetFeedResponseDto } from 'src/dto/response/get-feed.response.dto';
import { FeedImage } from 'src/entity/feed_image.entity';
import { Member } from 'src/entity/member.entity';
import { FollowQueryRepository } from 'src/repository/follow.query-repository';
import { MemberQueryRepository } from 'src/repository/member.query-repository';
import { PostQueryRepository } from 'src/repository/post.query-repository';
import { ProfileQueryRepository } from 'src/repository/profile.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Member) private readonly memberRepository: Repository<Member>,
    @InjectRepository(FeedImage) private readonly feedImageRepository: Repository<FeedImage>,
    private readonly memberQueryRepository: MemberQueryRepository,
    private readonly profileQueryRepository: ProfileQueryRepository,
    private readonly postQueryRepository: PostQueryRepository,
    private readonly followQueryRepository: FollowQueryRepository,
  ) {}

  async getOthersProfileInfo(memberId: number, myMemberId: number): Promise<GetOthersProfileDto> {
    const isDeletedUser = await this.memberQueryRepository.getMemberIsNotDeletedById(memberId);
    if (!isDeletedUser) {
      throw new GoneException('탈퇴한 유저입니다.');
    }
    const othersProfileInfo = await this.profileQueryRepository.getOthersProfileInfo(memberId, myMemberId);
    const othersFollowerCount = await this.followQueryRepository.getFollowerCountByMemberId(memberId);
    const othersFollowingCount = await this.followQueryRepository.getProfileFollowingCountByMemberId(memberId);

    othersProfileInfo.followerCount = othersFollowerCount;
    othersProfileInfo.followingCount = othersFollowingCount;

    return GetOthersProfileDto.from(othersProfileInfo);
  }

  async getMyProfileInfo(memberId: number): Promise<GetMyProfileDto> {
    const myProfileInfo = await this.profileQueryRepository.getMyProfileInfo(memberId);
    const myFollowerCount = await this.followQueryRepository.getFollowerCountByMemberId(memberId);
    const myFollowingCount = await this.followQueryRepository.getProfileFollowingCountByMemberId(memberId);

    myProfileInfo.followerCount = myFollowerCount;
    myProfileInfo.followingCount = myFollowingCount;

    return GetMyProfileDto.from(myProfileInfo);
  }

  async modifyMyProfile(memberId: number, nickname: string, profileImageUrl: string, introduce: string): Promise<void> {
    const memberInfo = await this.memberRepository.findOneBy({ id: memberId });
    if (!memberInfo) {
      throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');
    }
    memberInfo.setProfileInfo(nickname, profileImageUrl, introduce);
    await this.memberRepository.save(memberInfo);
  }

  async getPostList(memberId: number, paginationRequest: PaginationRequest) {
    const postListTuples = await this.profileQueryRepository.getPostList(memberId, paginationRequest);
    const totalCount = await this.profileQueryRepository.getAllPostListTotalCount(memberId);

    const postInfo = await Promise.all(
      postListTuples.map(async (postList) => {
        const post = GetPostList.from(postList);
        const hashTagInfo = await this.postQueryRepository.getPostDetailHashTag(postList.postId);
        return new GetPostListDto(post, hashTagInfo);
      }),
    );

    return { postInfo, totalCount };
  }

  async getFeedList(
    memberId: number,
    paginationRequest: PaginationRequest,
  ): Promise<{ feedList: GetFeedResponseDto[]; totalCount: number }> {
    const getFeedListTuple = await this.profileQueryRepository.getFeedList(memberId, paginationRequest);
    const totalCount = await this.profileQueryRepository.getFeedListCount(memberId);

    const feedList = await Promise.all(
      getFeedListTuple.map(async (item) => {
        const writer = {
          id: item.writerId,
          nickname: item.writerNickname,
          generation: item.writerGeneration,
          profileImageUrl: item.writerProfileImageUrl,
        };

        const feedImages = await this.feedImageRepository.findBy({ feedId: item.feedId });

        const feed = {
          id: item.feedId,
          content: item.feedContent,
          viewCount: item.feedViewCount,
          commentCount: item.feedCommentCount,
          emojiCount: item.feedEmojiCount,
          createdAt: item.feedCreatedAt,
          imageUrls: feedImages.map((feedImage) => feedImage.imageUrl),
        };

        return GetFeedResponseDto.from({ writer, feed });
      }),
    );

    return { feedList, totalCount };
  }
}
