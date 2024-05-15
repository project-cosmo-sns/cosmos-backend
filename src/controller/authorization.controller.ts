import { Body, Controller, Delete, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.decorator';
import { AuthorizationRequest } from 'src/dto/request/authorization.request';
import { ImageResponse } from 'src/dto/response/image.response';
import { RolesGuard } from 'src/guard/roles.guard';
import { AuthorizationService } from 'src/service/authorization.service';
import { ImageService } from 'src/service/image.service';

@ApiTags('인증')
@Controller('authorization')
@UseGuards(RolesGuard)
export class AuthorizationController {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly configService: ConfigService,
    private readonly imageService: ImageService,
  ) {}

  @Roles('login')
  @ApiOperation({ summary: '인증 보내기' })
  @Post('')
  async postAuthorizationInfo(@Req() req, @Body() authorizationRequest: AuthorizationRequest): Promise<void> {
    return this.authorizationService.postAuthorizationInfo(req.user.id, authorizationRequest);
  }

  @Roles('login')
  @ApiOperation({ summary: '인증 이미지 url 불러오기' })
  @Get('/image/create')
  async createUploadURL(): Promise<ImageResponse> {
    const bucket = this.configService.get('AWS_S3_UPLOAD_BUCKET_AUTHORIZATION');

    const uploadUrl = await this.imageService.createUploadURL(bucket);
    return new ImageResponse(uploadUrl);
  }

  @Roles('login')
  @ApiOperation({ summary: '인증 이미지 삭제' })
  @ApiParam({ name: 'imageUrls', required: true, description: '이미지 urls' })
  @Delete('/image/delete')
  async deleteImage(@Query('imageUrls') imageUrls: string[]): Promise<void> {
    const bucket = this.configService.get('AWS_S3_UPLOAD_BUCKET_AUTHORIZATION');

    await this.imageService.deleteImage(imageUrls, bucket);
  }
}
