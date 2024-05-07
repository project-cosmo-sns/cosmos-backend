import { Injectable, NotFoundException } from '@nestjs/common';
import { PostQueryRepository } from 'src/repository/post.query-repository';


@Injectable()
export class PostDomainService {
  constructor(private readonly postQueryRepository: PostQueryRepository) {}

async getPostIsNotDeleted(postId:number){
  const postInfo = await this.postQueryRepository.getIsNotDeletedPost(postId);

  if(!postInfo){
    throw new NotFoundException('해당 포스트를 찾을 수 없습니다.');
  }
  return postInfo;
}
}
