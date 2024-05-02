import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { HashTagDto } from '../hash-tag-dto';
import { Type } from 'class-transformer';

export class CreatePostInfoDto {
  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiProperty({ type: () => [HashTagDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HashTagDto)
  hashTags!: HashTagDto[];

  constructor(
    category: string,
    title: string,
    content: string,
    hashTags: HashTagDto[],
  ) {
    this.category = category;
    this.title = title;
    this.content = content;
    this.hashTags = hashTags;
  }
}