import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostDomainService } from 'src/domain-service/post.domain-service';
import { PostComment } from 'src/entity/post_comment.entity';
import { PostReply } from 'src/entity/post_reply.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostReplyService {
  constructor(
    private readonly postDomainService: PostDomainService,
    @InjectRepository(PostComment) private readonly postCommentRepository: Repository<PostComment>,
    @InjectRepository(PostReply) private readonly postReplyRepository: Repository<PostReply>,
  ) { }

  async writePostReply(postId: number, commentId: number, memberId: number, content: string): Promise<void> {
    await this.postDomainService.getPostIsNotDeleted(postId);

    const commentInfo = await this.postCommentRepository.findOneBy({ postId, id: commentId });
    if (!commentInfo) {
      throw new NotFoundException('답글을 생성할 댓글을 찾을 수 없습니다.');
    }

    const reply = await this.postReplyRepository.save({
      postId,
      commentId,
      memberId,
      content,
    });

  }
}