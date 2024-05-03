import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class HashTagDto {
  @ApiProperty({
    description: 'number 혹은 새로운 태그일 경우 null',
    example: 'number 혹은 새로운 태그일 경우 null'
  })
  @IsOptional()
  @IsNumber()
  hashTagId?: number;

  @ApiProperty()
  @IsString()
  tagName!: string;

  @ApiProperty()
  @IsString()
  color!: string;
}