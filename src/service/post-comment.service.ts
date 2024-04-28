import { GoneException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { GetPostCommentList } from 'src/dto/get-post-comment-list.dto';
import { Post } from 'src/entity/post.entity';
import { PostComment } from 'src/entity/post_comment.entity';
import { PostCommentQueryRepository } from 'src/repository/post-comment.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class PostCommentService {
  constructor(private readonly postCommentQueryRepository: PostCommentQueryRepository,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(PostComment) private readonly postCommentRepository: Repository<PostComment>
  ) { }

  async getPostCommentList(postId: number, memberId: number, paginationRequest: PaginationRequest) {
    const postCommentList = await this.postCommentQueryRepository.getPostCommentList(postId, memberId, paginationRequest);
    const totalCount = await this.postCommentQueryRepository.getPostCommentListCount(postId);

    const postCommentInfo = postCommentList.map((commentList) =>
      GetPostCommentList.from(commentList));
    return { postCommentInfo, totalCount };
  }

  async writePostComment(postId: number, memberId: number, content: string): Promise<void> {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException('해당 포스트를 찾을 수 없습니다.');
    }
    if (post.deletedAt !== null) {
      throw new GoneException('해당 포스트는 삭제되었습니다.');
    }
    post.plusCommentCount(post.commentCount);
    await this.postRepository.save(post);
    await this.postCommentRepository.save({
      postId: postId,
      memberId: memberId,
      content: content
    })
  }

  async patchPostComment(postId: number, commentId: number, memberId: number, content: string): Promise<void> {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException('해당 포스트를 찾을 수 없습니다.');
    }
    if (post.deletedAt !== null) {
      throw new GoneException('해당 포스트는 삭제되었습니다.');
    }

    const commentInfo = await this.postCommentRepository.findOneBy({ id: commentId, postId });
    if (!commentInfo) {
      throw new NotFoundException('해당 댓글을 찾을 수 없습니다.');
    }
    if (commentInfo.memberId !== memberId) {
      throw new UnauthorizedException('접근 권한이 없습니다.');
    }
    if (commentInfo.deletedAt !== null) {
      throw new GoneException('해당 댓글은 삭제되었습니다.');
    }

    commentInfo.setCommentInfo(content);
    await this.postCommentRepository.save(commentInfo);
  }
}