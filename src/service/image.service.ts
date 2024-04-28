import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class ImageService {
  constructor(private readonly configService: ConfigService) {}

  async createUploadURL(): Promise<string> {
    const S3_URL_EXPIRATION_SECONDS = 60 * 5;
    const randomId = Math.random() * 10000000;
    const key = `${randomId}.png`;

    const s3 = new AWS.S3({
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
      region: this.configService.get('AWS_REGION'),
    });

    const s3Params = {
      Bucket: this.configService.get('AWS_S3_UPLOAD_BUCKET'),
      Key: key,
      Expires: S3_URL_EXPIRATION_SECONDS,
      ContentType: 'image/png',
    };

    return s3.getSignedUrlPromise('putObject', s3Params);
  }
}
