import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { Authorization } from 'src/entity/authorization.entity';
import { Member } from 'src/entity/member.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthorizationQueryRepository {
  constructor(private readonly dataSource: DataSource) { }

  async getAuthorizationList(paginationRequest: PaginationRequest)
    : Promise<GetAuthorizationListTuple[]> {
    const list = await this.getAuthorizationListBaseQuery()
      .select([
        'member.id as memberId',
        'member.nickname as nickname',
        'authorization.generation as generation',
        'authorization.image_url as imageUrl',
        'authorization.created_at as createdAt'
      ])
      .limit(paginationRequest.take)
      .offset(paginationRequest.getSkip())
      .orderBy('authorization.created_at', paginationRequest.order)
      .getRawMany()
    return plainToInstance(GetAuthorizationListTuple, list);
  }

  async getAuthorizationListCount(): Promise<number> {
    return await this.getAuthorizationListBaseQuery().getCount();
  }

  private getAuthorizationListBaseQuery() {
    let query = this.dataSource
      .createQueryBuilder()
      .from(Authorization, 'authorization')
      .innerJoin(Member, 'member', 'member.id = authorization.member_id')
      .where('member.deleted_at IS NULL')
      .andWhere('authorization.is_checked = FALSE');
    return query;
  }
}

export class GetAuthorizationListTuple {
  memberId: number;
  nickname: string;
  generation: number;
  imageUrl: string;
  createdAt: Date;
}