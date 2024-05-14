import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { CategoryType, ListSortBy } from 'src/entity/common/Enums';

export class SortFeedList extends PaginationRequest {
  @ApiPropertyOptional({ description: '정렬 기준', enum: ListSortBy })
  @Type(() => String)
  @IsOptional()
  sortBy!: ListSortBy;
}