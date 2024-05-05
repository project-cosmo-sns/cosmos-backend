import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationRequest } from 'src/common/pagination/pagination-request';

export class GetSearchMemberByNameRequestDto extends PaginationRequest {
  @ApiProperty({ description: '멤버 이름 검색어' })
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  keyword!: string;
}
