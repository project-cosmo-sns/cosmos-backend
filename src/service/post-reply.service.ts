import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { PostDomainService } from 'src/domain-service/post.domain-service';
import { GetPostReplyList } from 'src/dto/get-post-reply-list.dto';
import { PostComment } from 'src/entity/post_comment.entity';
import { PostReply } from 'src/entity/post_reply.entity';
import { PostCommentQueryRepository } from 'src/repository/post-comment.query-repository';
import { Repository } from 'typeorm';

@Injectable()
export class PostReplyService {
  constructor(
    private readonly postDomainService: PostDomainService,
    private readonly postCommentQueryRepository: PostCommentQueryRepository,
    @InjectRepository(PostComment) private readonly postCommentRepository: Repository<PostComment>,
    @InjectRepository(PostReply) private readonly postReplyRepository: Repository<PostReply>,
  ) { }

  async writePostReply(postId: number, commentId: number, memberId: number, content: string): Promise<void> {
    await this.postDomainService.getPostIsNotDeleted(postId);

    const commentInfo = await this.postCommentRepository.findOneBy({ postId, id: commentId });
    if (!commentInfo) {
      throw new NotFoundException('해당 댓글을 찾을 수 없습니다.');
    }

    const reply = await this.postReplyRepository.save({
      postId,
      commentId,
      memberId,
      content,
    });

  }

  async patchPostReply(postId: number, replyId: number, memberId: number, content: string): Promise<void> {
    await this.postDomainService.getPostIsNotDeleted(postId);
    const replyInfo = await this.postReplyRepository.findOneBy({ id: replyId, postId });
    if (!replyInfo || replyInfo.deletedAt !== null) {
      throw new NotFoundException('해당 답글을 찾을 수 없습니다.');
    }
    if (replyInfo.memberId !== memberId) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    replyInfo.setPostReplyContent(content);
    await this.postReplyRepository.save(replyInfo);
  }

  async deletePostReply(postId: number, replyId: number, memberId: number): Promise<void> {
    await this.postDomainService.getPostIsNotDeleted(postId);
    const replyInfo = await this.postReplyRepository.findOneBy({ id: replyId, postId });
    if (!replyInfo || replyInfo.deletedAt !== null) {
      throw new NotFoundException('해당 답글을 찾을 수 없습니다.');
    }

    if (replyInfo.memberId !== memberId) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    replyInfo.setPostReplyDeleted(new Date());
    await this.postReplyRepository.save(replyInfo);

  }

  async getPostReplyList(commentId: number, memberId: number, paginationRequest: PaginationRequest) {
    const postReplyList = await this.postCommentQueryRepository.getPostReplyList(commentId, memberId, paginationRequest);
    const totalCount = await this.postCommentQueryRepository.getPostReplyListCount(commentId);
    const postReplyInfo = postReplyList.map((replyList) => GetPostReplyList.from(replyList));
    return { postReplyInfo, totalCount };
  }
}

export class PostReplyWriterDto {
  id: number;
  nickname: string;
  generation: number;
  profileImageUrl: string;
}

export class PostReplyDto {
  id: number;
  content: string;
  heartCount: number;
  isHearted: boolean;
  createdAt: Date;
  isMine: boolean;
}