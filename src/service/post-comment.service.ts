import { Injectable } from '@nestjs/common';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { GetPostCommentList } from 'src/dto/get-post-comment-list.dto';
import { PostCommentQueryRepository } from 'src/repository/post-comment.query-repository';

@Injectable()
export class PostCommentService {
  constructor(private readonly postCommentQueryRepository: PostCommentQueryRepository) { }

  async getPostCommentList(postId: number, memberId: number, paginationRequest: PaginationRequest) {
    const postCommentList = await this.postCommentQueryRepository.getPostCommentList(postId, memberId, paginationRequest);
    const totalCount = await this.postCommentQueryRepository.getPostCommentListCount(postId);

    const postCommentInfo = postCommentList.map((commentList) =>
      GetPostCommentList.from(commentList));
    return { postCommentInfo, totalCount };
  }
}