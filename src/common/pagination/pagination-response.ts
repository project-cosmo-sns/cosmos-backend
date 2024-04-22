import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PageMeta } from './page-meta';
import { PaginationRequest } from './pagination-request';

export class PaginationResponse<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: () => PageMeta })
  readonly meta: PageMeta;

  constructor(data: T[], meta: PageMeta) {
    this.data = data;
    this.meta = meta;
  }

  static of<T>(config: { data: T[]; options: PaginationRequest; totalCount: number }): PaginationResponse<T> {
    return new PaginationResponse(config.data, new PageMeta(config.options, config.totalCount));
  }
}
