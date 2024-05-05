import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class HashTagDto {
  @ApiProperty()
  @IsString()
  tagName!: string;

  @ApiProperty()
  @IsString()
  color!: string;
}
