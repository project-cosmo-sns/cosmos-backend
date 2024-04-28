import { ApiProperty } from '@nestjs/swagger';

export class ImageResponse {
  @ApiProperty()
  uploadURL: string;

  constructor(uploadURL: string) {
    this.uploadURL = uploadURL;
  }
}
