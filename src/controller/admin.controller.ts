import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { ApiPaginatedResponse } from 'src/common/pagination/pagination.decorator';
import { AuthorizationResponse } from 'src/dto/response/authorization-response';
import { RolesGuard } from 'src/guard/roles.guard';
import { AuthorizationService } from 'src/service/authorization.service';

@ApiTags('관리자 페이지')
@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly authorizationService: AuthorizationService) { }

  @ApiOperation({ summary: '인증 목록 불러오기' })
  @ApiPaginatedResponse(AuthorizationResponse)
  @Get('authorization/list')
  async getAuthorizationLists(
    @Req() req,
    @Query() paginationRequest: PaginationRequest
  ): Promise<PaginationResponse<AuthorizationResponse>> {
    const { authorizationInfo, totalCount } = await this.authorizationService.getAuthorizationList(req.user.id, paginationRequest);
    return PaginationResponse.of({
      data: AuthorizationResponse.from(authorizationInfo),
      options: paginationRequest,
      totalCount,
    });
  }
}