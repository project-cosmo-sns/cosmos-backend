import { GoneException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashTagDto } from 'src/dto/hash-tag-dto';
import { CreatePostInfoDto } from 'src/dto/create-post-dto';
import { HashTag } from 'src/entity/hash_tag.entity';
import { Member } from 'src/entity/member.entity';
import { Post } from 'src/entity/post.entity';
import { PostHashTag } from 'src/entity/post_hash_tag.entity';
import { Repository } from 'typeorm';
import { SortPostList } from 'src/dto/request/sort-post-list.request';
import { PostQueryRepository } from 'src/repository/post.query-repository';
import { GetPostList } from 'src/dto/get-post-list.dto';
import { GetPostDetailDto } from 'src/dto/get-post-detail.dto';
import { ListSortBy } from 'src/entity/common/Enums';
import { PostView } from 'src/entity/post_view.entity';
import { PostComment } from 'src/entity/post_comment.entity';
import { PostCommentHeart } from 'src/entity/post_comment_heart.entity';
import { PaginationRequest } from 'src/common/pagination/pagination-request';
import { GetPostCommentList } from 'src/dto/get-post-comment-list.dto';
import { HashTagSearchRequest } from 'src/dto/request/hash-tag-search.request';
import { GetHashTagSearch } from 'src/dto/get-hash-tag-search.dto';
import { PostEmoji } from 'src/entity/post_emoji.entity';

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
    private readonly postQueryRepository: PostQueryRepository,
  ) { }

  async createPost(memberId: number, dto: CreatePostInfoDto): Promise<void> {
    const member = await this.memberRepository.findOneBy({ id: memberId });
    if (member === null) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    const post = await this.postRepository.save({
      memberId,
      category: dto.category,
      title: dto.title,
      content: dto.content
    })
    await this.saveHashTags(post.id, dto.hashTags);
  }

  async getPostList(memberId: number, userGeneration: number, sortPostList: SortPostList) {
    const sortBy = sortPostList.sortBy;
    if (typeof memberId === 'undefined' && (sortBy === ListSortBy.BY_FOLLOW || sortBy === ListSortBy.BY_GENERATION)) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
    const postListTuples = await this.postQueryRepository.getPostList(memberId, sortPostList, sortBy, userGeneration);
    const totalCount = await this.postQueryRepository.getAllPostListTotalCount(memberId, sortPostList, sortBy, userGeneration);

    const postInfo = postListTuples.map((postList) =>
      GetPostList.from(postList));

    return { postInfo, totalCount };
  }

  async getPostDetail(postId: number): Promise<GetPostDetailDto> {
    const isDeletedPost = await this.postRepository.findOneBy({ id: postId });
    if (!isDeletedPost) {
      throw new NotFoundException('해당 포스트를 찾을 수 없습니다.');
    }
    if (isDeletedPost.deletedAt !== null) {
      throw new GoneException('해당 포스트는 삭제되었습니다.');
    }
    const postDetailInfo = await this.postQueryRepository.getPostDetail(postId);

    if (postDetailInfo.memberDeletedAt !== null) {
      throw new GoneException('해당 글 작성자가 존재하지 않습니다.');
    }

    const postDetailHashTagInfo = await this.postQueryRepository.getPostDetailHashTag(postId);

    return new GetPostDetailDto(postDetailInfo, postDetailHashTagInfo);
  }

  async deletePost(postId: number, memberId: number): Promise<void> {
    const postInfo = await this.postRepository.findOneBy({ id: postId });
    if (!postInfo) {
      throw new NotFoundException('해당 포스트를 찾을 수 없습니다.');
    }
    if (postInfo.memberId !== memberId) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    postInfo.deletePostInfo(new Date())
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
      emoji
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

  private async saveHashTags(postId: number, hashTags: HashTagDto[]): Promise<void> {
    await Promise.all(hashTags.map(async (hashTagDto) => {
      let tagId = hashTagDto.hashTagId;
      if (!hashTagDto.hashTagId) {
        const newHashTag = await this.hashTagRepository.save({
          tagName: hashTagDto.tagName,
          color: hashTagDto.color,
        });
        tagId = newHashTag.id;
      }

      await this.postHashTagRepository.save({
        postId,
        hashTagId: tagId,
      });
    }));
  }

  async getPostCommentList(postId: number, memberId: number, paginationRequest: PaginationRequest) {
    const postCommentList = await this.postQueryRepository.getPostCommentList(postId, memberId, paginationRequest);
    const totalCount = await this.postQueryRepository.getPostCommentListCount(postId);

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
}