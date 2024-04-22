import { ApiProperty } from '@nestjs/swagger';
import { PaginationRequest } from './pagination-request';

export class PageMeta {
  @ApiProperty()
  readonly page: number;

  @ApiProperty({ description: '가져올 갯수' })
  readonly take: number;

  @ApiProperty()
  readonly totalCount: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor(paginationRequest: PaginationRequest, totalCount: number) {
    this.page = paginationRequest.page;
    this.take = paginationRequest.take;
    this.totalCount = totalCount;
    this.pageCount = Math.ceil(this.totalCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
