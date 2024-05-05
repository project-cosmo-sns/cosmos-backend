import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FollowerResponse } from 'src/dto/response/follower.response';
import { FollowingResponse } from 'src/dto/response/following.response';
import { RolesGuard } from 'src/guard/roles.guard';
import { FollowService } from 'src/service/follow.service';

@ApiTags('팔로우')
@Controller('follow')
@UseGuards(RolesGuard)
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @ApiOperation({ summary: '팔로우' })
  @ApiConflictResponse({ status: 409, description: '이미 팔로우 되어 있을 경우' })
  @ApiGoneResponse({ status: 410, description: '팔로우할 유저가 탈퇴한 경우' })
  @ApiParam({ name: 'memberId', required: true, description: '팔로우할 멤버 id' })
  @Post(':memberId')
  async postFollow(@Param('memberId', ParseIntPipe) memberId: number, @Req() req): Promise<void> {
    return this.followService.followMember(req.user.id, memberId);
  }

  @ApiOperation({ summary: '언팔로우' })
  @ApiNotFoundResponse({ status: 404, description: '팔로우 되어있지 않을 경우' })
  @ApiGoneResponse({ status: 410, description: '팔로우할 유저가 탈퇴한 경우' })
  @ApiParam({ name: 'memberId', required: true, description: '언팔로우할 멤버 id' })
  @Delete(':memberId')
  async deleteFollow(@Param('memberId', ParseIntPipe) memberId: number, @Req() req): Promise<void> {
    return this.followService.unFollowMember(req.user.id, memberId);
  }

  @ApiOperation({ summary: '팔로워 목록 (해당 member를 팔로우 하는 유저) ' })
  @ApiParam({ name: 'memberId', required: true, description: '멤버 id' })
  @ApiResponse({ type: FollowerResponse })
  @Get(':memberId/follower')
  async getFollowerList(@Param('memberId', ParseIntPipe) memberId: number): Promise<FollowerResponse[]> {
    const followerList = await this.followService.getFollowerLists(memberId);
    return FollowerResponse.from(followerList);
  }

  @ApiOperation({ summary: '팔로잉 목록 (해당 member가 팔로우 하는 유저) ' })
  @ApiParam({ name: 'memberId', required: true, description: '멤버 id' })
  @ApiResponse({ type: FollowingResponse })
  @Get(':memberId/following')
  async getFollowingList(@Param('memberId', ParseIntPipe) memberId: number): Promise<FollowingResponse[]> {
    const followingList = await this.followService.getFollowingLists(memberId);
    return FollowingResponse.from(followingList);
  }

  @ApiOperation({ summary: '내 팔로워 목록 (나를 팔로우 하는 유저)' })
  @ApiResponse({ type: FollowerResponse })
  @Get('/follower/mine')
  async getFollowerListMine(@Req() req): Promise<FollowerResponse[]> {
    const followerList = await this.followService.getFollowerLists(req.user.id);
    return FollowerResponse.from(followerList);
  }

  @ApiOperation({ summary: '내 팔로잉 목록 (내가 팔로우 하는 유저)' })
  @ApiResponse({ type: FollowingResponse })
  @Get('/following/mine')
  async getFollowingListMine(@Req() req): Promise<FollowingResponse[]> {
    const followingList = await this.followService.getFollowingLists(req.user.id);
    return FollowingResponse.from(followingList);
  }
}
