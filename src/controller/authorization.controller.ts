import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthorizationRequest } from 'src/dto/request/authorization.request';
import { RolesGuard } from 'src/guard/roles.guard';
import { AuthorizationService } from 'src/service/authorization.service';

@ApiTags('인증')
@Controller('authorization')
@UseGuards(RolesGuard)
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) { }

  @ApiOperation({ summary: '인증 보내기' })
  @Post('')
  async postAuthorizationINfo(
    @Req() req,
    @Body() authorizationRequest: AuthorizationRequest
  ): Promise<void> {
    return this.authorizationService.postAuthorizationInfo(req.user.id, authorizationRequest);
  }

}