import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class HashTagDto {
  @ApiProperty()
  @IsString()
  tagName!: string;

  @ApiProperty()
  @IsString()
  color!: string;
}