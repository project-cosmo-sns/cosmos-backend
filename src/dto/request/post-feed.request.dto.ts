import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PostFeedRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  constructor(content: string) {
    this.content = content;
  }
}
