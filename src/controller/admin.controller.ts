import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { ApiPaginatedResponse } from 'src/common/pagination/pagination.decorator';
import { AuthorizationResponse } from 'src/dto/response/authorization-response';
import { AdminGuard } from 'src/guard/admin.guard';
import { AuthorizationService } from 'src/service/authorization.service';

@ApiTags('관리자 페이지')
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @ApiOperation({ summary: '인증 목록 불러오기' })
  @ApiPaginatedResponse(AuthorizationResponse)
  @Get('authorization/list')
  async getAuthorizationLists(
    @Req() req,
    @Query() paginationRequest: PaginationRequest,
  ): Promise<PaginationResponse<AuthorizationResponse>> {
    const { authorizationInfo, totalCount } = await this.authorizationService.getAuthorizationList(
      req.user.id,
      paginationRequest,
    );
    return PaginationResponse.of({
      data: AuthorizationResponse.from(authorizationInfo),
      options: paginationRequest,
      totalCount,
    });
  }

  @ApiOperation({ summary: '인증 승인' })
  @ApiParam({ name: 'memberId', required: true, description: '멤버 id' })
  @Post(':memberId/accept')
  async postAuthorizationAcception(@Req() req, @Param('memberId') memberId: number): Promise<void> {
    await this.authorizationService.acceptAuthorization(req.user.id, memberId);
  }

  @ApiOperation({ summary: '인증 거절' })
  @ApiParam({ name: 'memberId', required: true, description: '멤버 id' })
  @Post(':memberId/decline')
  async postAuthorizationDecline(@Req() req, @Param('memberId') memberId: number): Promise<void> {
    await this.authorizationService.declineAuthorization(req.user.id, memberId);
  }
}
