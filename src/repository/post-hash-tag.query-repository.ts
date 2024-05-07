import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { HashTagSearchRequest } from 'src/dto/request/hash-tag-search.request';
import { HashTag } from 'src/entity/hash_tag.entity';
import { PostHashTag } from 'src/entity/post_hash_tag.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PostHashTagQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

  async getPostHashTag(postId: number): Promise<GetPostHashTagTuple[]> {
    const postHashTag = await this.dataSource
      .createQueryBuilder()
      .from(HashTag, 'hash_tag')
      .innerJoin(PostHashTag, 'post_hash_tag', 'post_hash_tag.hash_tag_id = hash_tag.id')
      .where('post_hash_tag.post_id = :postId', { postId })
      .select(['hash_tag.tagName as tagName', 'hash_tag.color as color'])
      .getRawMany();
    return plainToInstance(GetPostHashTagTuple, postHashTag);
  }

  async getHashTagSearchList(search: HashTagSearchRequest): Promise<GetHashTagSearchTuple[]> {
    const searchResult = await this.dataSource
      .createQueryBuilder()
      .from(HashTag, 'hash_Tag')
      .select(['tag_name as tagName', 'color as color'])
      .where(`tag_name LIKE '%${search.searchWord}%'`)
      .limit(10)
      .getRawMany();

    return plainToInstance(GetHashTagSearchTuple, searchResult);
  }
}

export class GetPostHashTagTuple {
  tagName: string;
  color: string;
}

export class GetHashTagSearchTuple {
  tagName!: string;
  color!: string;
}