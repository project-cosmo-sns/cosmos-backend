import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString } from "class-validator";

export class HashTagSearchRequest {
  @ApiProperty({ description: '검색 단어' })
  @Type(() => String)
  @IsString()
  searchWord!: string;
}