import { Controller, Post } from '@nestjs/common';
import { ImageResponse } from 'src/dto/response/image.response';
import { ImageService } from 'src/service/image.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('')
  async createUploadURL(): Promise<ImageResponse> {
    const uploadUrl = await this.imageService.createUploadURL();
    return new ImageResponse(uploadUrl);
  }
}
