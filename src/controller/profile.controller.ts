import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { ApiPaginatedResponse } from 'src/common/pagination/pagination.decorator';
import { Roles } from "src/common/roles/roles.decorator";
import { profileInfoRequestDto } from 'src/dto/request/profile-info.request';
import { MyProfileInfoResponse } from 'src/dto/response/my-profile-info.response';
import { OthersProfileInfoResponse } from "src/dto/response/others-profile-info.response";
import { ProfilePostResponse } from 'src/dto/response/profile/my-profile-post.response';
import { RolesGuard } from "src/guard/roles.guard";
import { ProfileService } from "src/service/profile.service";

@ApiTags('프로필')
@Controller('profile')
@UseGuards(RolesGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @ApiOperation({ summary: '나의 프로필 조회' })
  @ApiResponse({ type: MyProfileInfoResponse })
  @Get('mine')
  async getMyProfileInfo(@Req() req): Promise<MyProfileInfoResponse> {
    const myProfileInfo = await this.profileService.getMyProfileInfo(req.user.id);
    return MyProfileInfoResponse.from(myProfileInfo);
  }

  @ApiOperation({ summary: '다른 유저 프로필 조회' })
  @ApiParam({ name: 'memberId', required: true, description: '유저 id' })
  @ApiResponse({ type: OthersProfileInfoResponse })
  @Get(':memberId')
  async getOthersProfileInfo(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Req() req): Promise<OthersProfileInfoResponse> {
    const othersProfileInfo = await this.profileService.getOthersProfileInfo(memberId, req.user.id);
    return OthersProfileInfoResponse.from(othersProfileInfo);
  }


  @ApiOperation({ summary: '나의 프로필 수정' })
  @Patch('mine')
  async patchMyProfile(
    @Req() req,
    @Body() profileInfoRequestDto: profileInfoRequestDto): Promise<void> {
    return this.profileService.modifyMyProfile(
      req.user.id,
      profileInfoRequestDto.nickname,
      profileInfoRequestDto.profileImageUrl,
      profileInfoRequestDto.introduce
    );
  }

  @ApiOperation({ summary: '나의 프로필 포스트 목록' })
  @ApiPaginatedResponse(ProfilePostResponse)
  @Get('mine/post')
  async myProifilePost(
    @Req() req,
    @Query() paginationRequest: PaginationRequest,
  ): Promise<PaginationResponse<ProfilePostResponse>> {
    const { postInfo, totalCount } = await this.profileService.getPostList(req.user.id, paginationRequest);
    const postData = postInfo.map((info) => ProfilePostResponse.from(info));
    return PaginationResponse.of({
      data: postData,
      options: paginationRequest,
      totalCount,
    })
  }



  @ApiOperation({ summary: '타 유저 프로필 포스트 목록' })
  @ApiPaginatedResponse(ProfilePostResponse)
  @Get(':memberId/post')
  async othersProifilePost(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() paginationRequest: PaginationRequest,
  ): Promise<PaginationResponse<ProfilePostResponse>> {
    const { postInfo, totalCount } = await this.profileService.getPostList(memberId, paginationRequest);
    const postData = postInfo.map((info) => ProfilePostResponse.from(info));
    return PaginationResponse.of({
      data: postData,
      options: paginationRequest,
      totalCount,
    })
  }

}