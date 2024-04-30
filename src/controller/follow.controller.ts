import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FollowerResponse } from "src/dto/response/follower.response";
import { FollowingResponse } from "src/dto/response/following.response";
import { RolesGuard } from "src/guard/roles.guard";
import { FollowService } from "src/service/follow.service";

@ApiTags('팔로우')
@Controller('follow')
@UseGuards(RolesGuard)
export class FollowController {
  constructor(private readonly followService: FollowService) { }

  @ApiOperation({ summary: '팔로우 목록 (해당 member가 팔로우 하는 유저) ' })
  @ApiParam({ name: 'memberId', required: true, description: '멤버 id' })
  @ApiResponse({ type: FollowerResponse })
  @Get(':memberId/follower')
  async getFollowerList(
    @Param('memberId', ParseIntPipe) memberId: number,
  ): Promise<FollowerResponse[]> {
    const followerList = await this.followService.getFollowerLists(memberId);
    return FollowerResponse.from(followerList);
  }

  @ApiOperation({ summary: '팔로잉 목록 (해당 member를 팔로우 하는 유저) ' })
  @ApiParam({ name: 'memberId', required: true, description: '멤버 id' })
  @ApiResponse({ type: FollowingResponse })
  @Get(':memberId/following')
  async getFollowingList(
    @Param('memberId', ParseIntPipe) memberId: number,
  ): Promise<FollowingResponse[]> {
    const followingList = await this.followService.getFollowingLists(memberId);
    return FollowingResponse.from(followingList);
  }

}