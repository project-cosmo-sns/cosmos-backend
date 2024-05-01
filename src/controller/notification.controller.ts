import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { ApiPaginatedResponse } from 'src/common/pagination/pagination.decorator';
import { GetNotificationResponseDto } from 'src/dto/response/get-notification.response.dto';
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
}
