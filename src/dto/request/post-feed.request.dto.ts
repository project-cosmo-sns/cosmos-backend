import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class PostFeedRequestDto {
  @ApiProperty()
  @IsString()
  content!: string;

  constructor(content: string) {
    this.content = content;
  }
}
