import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/common/roles/roles.decorator";
import { MyProfileInfoResponse } from 'src/dto/response/my-profile-info.response';
import { OthersProfileInfoResponse } from "src/dto/response/others-profile-info.response";
import { RolesGuard } from "src/guard/roles.guard";
import { ProfileService } from "src/service/profile.service";

@ApiTags('프로필')
@Controller('profile')
@UseGuards(RolesGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @ApiOperation({ summary: '나의 프로필 조회' })
  @ApiResponse({ type: MyProfileInfoResponse })
  @Get('my-profile')
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



}