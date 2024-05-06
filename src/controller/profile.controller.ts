import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { ApiPaginatedResponse } from 'src/common/pagination/pagination.decorator';
import { Roles } from 'src/common/roles/roles.decorator';
import { profileInfoRequestDto } from 'src/dto/request/profile-info.request';
import { GetFeedResponseDto } from 'src/dto/response/get-feed.response.dto';
import { ImageResponse } from 'src/dto/response/image.response';
import { MyProfileInfoResponse } from 'src/dto/response/my-profile-info.response';
import { OthersProfileInfoResponse } from 'src/dto/response/others-profile-info.response';
import { ProfilePostResponse } from 'src/dto/response/profile/my-profile-post.response';
import { RolesGuard } from 'src/guard/roles.guard';
import { ImageService } from 'src/service/image.service';
import { ProfileService } from 'src/service/profile.service';

@ApiTags('프로필')
@Controller('profile')
@UseGuards(RolesGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly imageService: ImageService,
    private readonly configService: ConfigService,
  ) { }

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
    @Req() req,
  ): Promise<OthersProfileInfoResponse> {
    const othersProfileInfo = await this.profileService.getOthersProfileInfo(memberId, req.user.id);
    return OthersProfileInfoResponse.from(othersProfileInfo);
  }

  @ApiOperation({ summary: '나의 프로필 수정' })
  @Patch('mine')
  async patchMyProfile(@Req() req, @Body() profileInfoRequestDto: profileInfoRequestDto): Promise<void> {
    return this.profileService.modifyMyProfile(
      req.user.id,
      profileInfoRequestDto.nickname,
      profileInfoRequestDto.profileImageUrl,
      profileInfoRequestDto.introduce,
    );
  }

  @ApiOperation({ summary: '나의 프로필 피드 목록' })
  @ApiPaginatedResponse(GetFeedResponseDto)
  @Get('mine/feed')
  async getMyFeedList(
    @Req() req,
    @Query() paginationRequest: PaginationRequest,
  ): Promise<PaginationResponse<GetFeedResponseDto>> {
    const { feedList, totalCount } = await this.profileService.getFeedList(req.user.id, paginationRequest);

    return PaginationResponse.of({
      data: feedList,
      options: paginationRequest,
      totalCount,
    });
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
    });
  }

  @ApiOperation({ summary: '타 유저 프로필 피드 목록' })
  @ApiPaginatedResponse(GetFeedResponseDto)
  @ApiParam({ name: 'postId', required: true, description: '멤버 id' })
  @Get(':memberId/feed')
  async getOthersFeedList(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() paginationRequest: PaginationRequest,
  ): Promise<PaginationResponse<GetFeedResponseDto>> {
    const { feedList, totalCount } = await this.profileService.getFeedList(memberId, paginationRequest);

    return PaginationResponse.of({
      data: feedList,
      options: paginationRequest,
      totalCount,
    });
  }

  @ApiOperation({ summary: '타 유저 프로필 포스트 목록' })
  @ApiPaginatedResponse(ProfilePostResponse)
  @ApiParam({ name: 'postId', required: true, description: '멤버 id' })
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
    });
  }

  @ApiOperation({ summary: '프로필 이미지 url 불러오기' })
  @Get('/image/create')
  async createUploadURL(): Promise<ImageResponse> {
    const bucket = this.configService.get('AWS_S3_UPLOAD_BUCKET_PROFILE');

    const uploadUrl = await this.imageService.createUploadURL(bucket);
    return new ImageResponse(uploadUrl);
  }

  @ApiOperation({ summary: '프로필 이미지 삭제' })
  @ApiParam({ name: 'imageUrls', required: true, description: '이미지 urls' })
  @Delete('/image/delete')
  async deleteImage(@Query('imageUrls') imageUrls: string[]): Promise<void> {
    const bucket = this.configService.get('AWS_S3_UPLOAD_BUCKET_PROFILE');

    await this.imageService.deleteImage(imageUrls, bucket);
  }
}
