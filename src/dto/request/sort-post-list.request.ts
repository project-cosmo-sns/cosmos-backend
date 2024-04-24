import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { ListSortBy } from 'src/entity/common/Enums';

export class SortPostList extends PaginationRequest {
  @Type(() => String)
  @IsOptional()
  @ApiProperty({ description: '정렬 기준' })
  sortBy!: ListSortBy;
}