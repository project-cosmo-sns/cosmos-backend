import { Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { ApiPaginatedResponse } from 'src/common/pagination/pagination.decorator';
import { GetNotificationSettingMineResponseDto } from 'src/dto/response/get-notification-setting-mine.response.dto';
import { GetNotificationResponseDto } from 'src/dto/response/get-notification.response.dto';
import { NotificationSettingType } from 'src/entity/common/Enums';
import { RolesGuard } from 'src/guard/roles.guard';
import { NotificationService } from 'src/service/notification.service';

@ApiTags('알림')
@Controller('notification')
@UseGuards(RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: '알림 목록' })
  @ApiPaginatedResponse(GetNotificationResponseDto)
  @Get('/list')
  async getFeedList(
    @Req() req,
    @Query() paginationRequest: PaginationRequest,
  ): Promise<PaginationResponse<GetNotificationResponseDto>> {
    const { notificationList, totalCount } = await this.notificationService.getNotificationList(
      req.user.id,
      paginationRequest,
    );

    return PaginationResponse.of({
      data: notificationList,
      options: paginationRequest,
      totalCount,
    });
  }

  @ApiOperation({ summary: '알림 확인' })
  @ApiUnauthorizedResponse({ status: 401, description: '해당 알림을 받은 사람이 아닐 경우' })
  @ApiNotFoundResponse({ status: 404, description: '해당 알림을 찾을 수 없는 경우' })
  @Post('/:notificationId/confirm')
  async confirmNotification(@Req() req, @Param('notificationId', ParseIntPipe) notificationId: number): Promise<void> {
    await this.notificationService.confirmNotification(req.user.id, notificationId);
  }

  @ApiOperation({ summary: '알림 설정 받아오기' })
  @Get('/setting/mine')
  async getNotificationSetting(@Req() req): Promise<GetNotificationSettingMineResponseDto> {
    return await this.notificationService.getNotificationSettingMine(req.user.id);
  }

  @ApiOperation({ summary: '알림 설정 수락' })
  @ApiParam({
    name: 'notificationSettingType',
    required: true,
    description: '알림 설정 타입',
    enum: NotificationSettingType,
  })
  @Patch('/setting/accept/:notificationSettingType')
  async acceptNotificationSetting(
    @Req() req,
    @Param('notificationSettingType') notificationSettingType: NotificationSettingType,
  ): Promise<void> {
    await this.notificationService.acceptNotificationSetting(req.user.id, notificationSettingType);
  }

  @ApiOperation({ summary: '알림 설정 거절' })
  @ApiParam({
    name: 'notificationSettingType',
    required: true,
    description: '알림 설정 타입',
    enum: NotificationSettingType,
  })
  @Patch('/setting/reject/:notificationSettingType')
  async rejectNotificationSetting(
    @Req() req,
    @Param('notificationSettingType') notificationSettingType: NotificationSettingType,
  ): Promise<void> {
    await this.notificationService.rejectNotificationSetting(req.user.id, notificationSettingType);
  }
}
