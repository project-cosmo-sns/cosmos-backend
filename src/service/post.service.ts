import { GoneException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashTagDto } from 'src/dto/hash-tag-dto';
import { CreatePostInfoDto } from 'src/dto/request/create-post-dto';
import { HashTag } from 'src/entity/hash_tag.entity';
import { Member } from 'src/entity/member.entity';
import { Post } from 'src/entity/post.entity';
import { PostHashTag } from 'src/entity/post_hash_tag.entity';
import { Repository } from 'typeorm';
import { SortPostList } from 'src/dto/request/sort-post-list.request';
import { PostQueryRepository } from 'src/repository/post.query-repository';
import { GetPostList, GetPostListDto } from 'src/dto/get-post-list.dto';
import { GetPostDetail, GetPostDetailDto } from 'src/dto/get-post-detail.dto';
import { ListSortBy, NotificationType } from 'src/entity/common/Enums';
import { PostView } from 'src/entity/post_view.entity';
import { PostComment } from 'src/entity/post_comment.entity';
import { PostCommentHeart } from 'src/entity/post_comment_heart.entity';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { GetPostCommentList } from 'src/dto/get-post-comment-list.dto';
import { HashTagSearchRequest } from 'src/dto/request/hash-tag-search.request';
import { GetHashTagSearch } from 'src/dto/get-hash-tag-search.dto';
import { PostEmoji } from 'src/entity/post_emoji.entity';
import { MemberQueryRepository } from 'src/repository/member.query-repository';
import { Notification } from 'src/entity/notification.entity';
import { CreatePostResponse } from 'src/dto/response/create-post.response';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Member) private readonly memberRepository: Repository<Member>,
    @InjectRepository(HashTag) private readonly hashTagRepository: Repository<HashTag>,
    @InjectRepository(PostHashTag) private readonly postHashTagRepository: Repository<PostHashTag>,
    @InjectRepository(PostView) private readonly postViewRepository: Repository<PostView>,
    @InjectRepository(PostComment) private readonly postCommentRepository: Repository<PostComment>,
    @InjectRepository(PostCommentHeart) private readonly postCommentHeartRepository: Repository<PostCommentHeart>,
    @InjectRepository(PostEmoji) private readonly postEmojiRepository: Repository<PostEmoji>,
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    private readonly postQueryRepository: PostQueryRepository,
    private readonly memberQueryRepository: MemberQueryRepository,
  ) {}

  async createPost(memberId: number, dto: CreatePostInfoDto): Promise<CreatePostResponse> {
    const member = await this.memberRepository.findOneBy({ id: memberId });
    if (member === null) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    const post = await this.postRepository.save({
      memberId,
      category: dto.category,
      title: dto.title,
      content: dto.content,
    });
    await this.saveHashTags(post.id, dto.hashTags);

    return new CreatePostResponse(post.id);
  }

  async getPostList(memberId: number, userGeneration: number, sortPostList: SortPostList) {
    const sortBy = sortPostList.sortBy;
    if (typeof memberId === 'undefined' && (sortBy === ListSortBy.BY_FOLLOW || sortBy === ListSortBy.BY_GENERATION)) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
    const postListTuples = await this.postQueryRepository.getPostList(memberId, sortPostList, sortBy, userGeneration);
    const totalCount = await this.postQueryRepository.getAllPostListTotalCount(
      memberId,
      sortPostList,
      sortBy,
      userGeneration,
    );

    const postInfo = await Promise.all(
      postListTuples.map(async (postList) => {
        const post = GetPostList.from(postList);
        const hashTagInfo = await this.postQueryRepository.getPostDetailHashTag(postList.postId);
        return new GetPostListDto(post, hashTagInfo);
      }),
    );

    return { postInfo, totalCount };
  }

  async getPostDetail(postId: number, memberId: number): Promise<GetPostDetailDto> {
    const isDeletedPost = await this.postRepository.findOneBy({ id: postId });
    if (!isDeletedPost) {
      throw new NotFoundException('해당 포스트를 찾을 수 없습니다.');
    }
    if (isDeletedPost.deletedAt !== null) {
      throw new GoneException('해당 포스트는 삭제되었습니다.');
    }
    const postDetailInfo = await this.postQueryRepository.getPostDetail(postId, memberId);

    if (postDetailInfo.memberDeletedAt !== null) {
      throw new GoneException('해당 글 작성자가 존재하지 않습니다.');
    }

    const postDetailHashTagInfo = await this.postQueryRepository.getPostDetailHashTag(postId);
    const postDetailEmojiInfo = await this.postQueryRepository.getPostDetailEmoji(postId, memberId);

    const postDetail = GetPostDetail.from(postDetailInfo);
    return new GetPostDetailDto(postDetail, postDetailHashTagInfo, postDetailEmojiInfo);
  }

  async modifyPost(postId: number, memberId: number, dto: CreatePostInfoDto): Promise<void> {
    const postInfo = await this.postRepository.findOneBy({ id: postId });
    if (!postInfo || postInfo.deletedAt !== null) {
      throw new NotFoundException('해당 포스트가 없거나 삭제되었습니다.');
    }
    if (postInfo.memberId !== memberId) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
    const hashTags = await this.postHashTagRepository.findBy({ postId });

    postInfo.setPostInfo(dto.category, dto.title, dto.content);
    await this.postRepository.save(postInfo);

    await Promise.all(hashTags.map((tag) => this.postHashTagRepository.remove(tag)));
    await this.saveHashTags(postInfo.id, dto.hashTags);
  }

  async deletePost(postId: number, memberId: number): Promise<void> {
    const postInfo = await this.postRepository.findOneBy({ id: postId });
    if (!postInfo) {
      throw new NotFoundException('해당 포스트를 찾을 수 없습니다.');
    }
    if (postInfo.memberId !== memberId) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    postInfo.deletePostInfo(new Date());
    await this.postRepository.save(postInfo);
  }

  async createPostEmoji(postId: number, memberId: number, emoji: string) {
    const postInfo = await this.postRepository.findOneBy({ id: postId });
    if (!postInfo) {
      throw new NotFoundException('해당 포스트를 찾을 수 없습니다.');
    }
    if (postInfo.deletedAt !== null) {
      throw new GoneException('해당 포스트는 삭제되었습니다.');
    }

    postInfo.plusEmojiCount(postInfo.emojiCount);
    await this.postRepository.save(postInfo);

    await this.postEmojiRepository.save({
      postId,
      memberId,
      emoji,
    });
  }

  async removePostEmoji(postId: number, memberId: number, emojiId: number) {
    const postInfo = await this.postRepository.findOneBy({ id: postId });
    if (!postInfo) {
      throw new NotFoundException('해당 포스트를 찾을 수 없습니다.');
    }
    if (postInfo.deletedAt !== null) {
      throw new GoneException('해당 포스트는 삭제되었습니다.');
    }

    const emojiInfo = await this.postEmojiRepository.findOneBy({ id: emojiId });
    if (!emojiInfo) {
      throw new NotFoundException('해당 이모지를 찾을 수 없습니다.');
    }
    if (emojiInfo.memberId !== memberId) {
      throw new UnauthorizedException('삭제 권한이 없습니다.');
    }

    postInfo.minusEmojiCount(postInfo.emojiCount);
    await this.postRepository.save(postInfo);

    await this.postEmojiRepository.remove(emojiInfo);
  }

  async increasePostViewCount(postId: number, memberId: number): Promise<void> {
    const postInfo = await this.postRepository.findOneBy({ id: postId });
    if (!postInfo) {
      throw new NotFoundException('해당 포스트를 찾을 수 없습니다.');
    }
    if (postInfo.deletedAt) {
      throw new GoneException('해당 포스트는 삭제되었습니다.');
    }
    if (memberId) {
      await this.postViewRepository.save({ postId, memberId });
    }
    postInfo.plusPostViewCount(postInfo.viewCount);
    await this.postRepository.save(postInfo);
  }

  async getPostCommentList(postId: number, memberId: number, paginationRequest: PaginationRequest) {
    const postCommentList = await this.postQueryRepository.getPostCommentList(postId, memberId, paginationRequest);
    const totalCount = await this.postQueryRepository.getPostCommentListCount(postId);

    const postCommentInfo = postCommentList.map((commentList) => GetPostCommentList.from(commentList));
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
    const comment = await this.postCommentRepository.save({
      postId: postId,
      memberId: memberId,
      content: content,
    });

    this.newPostCommentNotification(post.memberId, memberId, postId, comment.id);
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

  async deletePostComment(postId: number, commentId: number, memberId: number): Promise<void> {
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

    post.minusCommentCount(post.commentCount);
    await this.postRepository.save(post);

    commentInfo.deleteCommentInfo(new Date());
    await this.postCommentRepository.save(commentInfo);
  }

  async heartPostComment(postId: number, commentId: number, memberId: number): Promise<void> {
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
    if (commentInfo.deletedAt !== null) {
      throw new GoneException('해당 댓글은 삭제되었습니다.');
    }
    commentInfo.plusCommentHeartCount(commentInfo.heartCount);
    await this.postCommentRepository.save(commentInfo);

    await this.postCommentHeartRepository.save({ commentId, memberId });
  }

  async deletePostCommentHeart(postId: number, commentId: number, memberId: number) {
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
    if (commentInfo.deletedAt !== null) {
      throw new GoneException('해당 댓글은 삭제되었습니다.');
    }
    const commentHeartInfo = await this.postCommentHeartRepository.findOneBy({ commentId, memberId });
    if (!commentHeartInfo) {
      throw new NotFoundException('해당 댓글 좋아요를 찾을 수 없습니다.');
    }
    commentInfo.minusCommentHeartCount(commentInfo.heartCount);
    await this.postCommentRepository.save(commentInfo);
    await this.postCommentHeartRepository.remove(commentHeartInfo);
  }

  async getHashTagSearchInfo(hashTagResult: HashTagSearchRequest) {
    const hashTagSearchTuples = await this.postQueryRepository.getHashTagSearchList(hashTagResult);
    const hashTagSearchInfo = hashTagSearchTuples.map((hashTagSearch) => GetHashTagSearch.from(hashTagSearch));
    return hashTagSearchInfo;
  }

  private async saveHashTags(postId: number, hashTags: HashTagDto[]): Promise<void> {
    await Promise.all(
      hashTags.map(async (hashTagDto) => {
        const hashTag = await this.hashTagRepository.findOneBy({ tagName: hashTagDto.tagName });
        let hashTagId = 0;

        if (!hashTag) {
          const newHashTag = await this.hashTagRepository.save({
            tagName: hashTagDto.tagName,
            color: hashTagDto.color,
          });
          hashTagId = newHashTag.id;
        } else {
          hashTagId = hashTag.id;
        }

        await this.postHashTagRepository.save({
          postId,
          hashTagId,
        });
      }),
    );
  }

  private async newPostCommentNotification(receivedMemberId, sendMemberId, postId, commentId) {
    if (receivedMemberId === sendMemberId) {
      return;
    }

    try {
      const sendMember = await this.memberQueryRepository.getMemberIsNotDeletedById(sendMemberId);

      if (!sendMember) {
        throw new NotFoundException('해당 회원을 찾을 수 없습니다.');
      }

      const notification = new Notification();

      notification.memberId = receivedMemberId;
      notification.sendMemberId = sendMemberId;
      notification.notificationType = JSON.stringify({
        type: NotificationType.CREATE_POST_COMMENT,
        postId,
        commentId,
      });
      notification.content = `${sendMember.nickname}님이 회원님의 포스트에 댓글을 남겼습니다.`;

      await this.notificationRepository.save(notification);
    } catch (e) {
      console.error(e);
    }
  }
}

export class PostWriterDto {
  id: number;
  nickname: string;
  generation: number;
  profileImageUrl: string;
}

export class PostListDto {
  id: number;
  category: string;
  title: string;
  content: string;
  viewCount: number;
  commentCount: number;
  emojiCount: number;
  createdAt: Date;
}

export class PostDetailDto {
  id: number;
  category: string;
  title: string;
  content: string;
  viewCount: number;
  commentCount: number;
  emojiCount: number;
  createdAt: Date;
  isMine: boolean;
}

export class PostCommentWriterDto {
  id: number;
  nickname: string;
  generation: number;
  profileImageUrl: string;
}

export class PostCommentDto {
  id: number;
  content: string;
  heartCount: number;
  isHearted: boolean;
  createdAt: Date;
}
