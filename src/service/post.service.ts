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

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Member) private readonly memberRepository: Repository<Member>,
    @InjectRepository(HashTag) private readonly hashTagRepository: Repository<HashTag>,
    @InjectRepository(PostHashTag) private readonly postHashTagRepository: Repository<PostHashTag>,
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
  async getPostList(memberId: number, sortPostList: SortPostList) {
    const sortBy = sortPostList.sortBy;
    if (typeof memberId === 'undefined' && (sortBy === ListSortBy.BY_FOLLOW || sortBy === ListSortBy.BY_GENERATION)) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    let memberGeneration = -999;
    if (memberId) {
      const member = await this.memberRepository.findOneBy({ id: memberId });
      if (!member) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }
      memberGeneration = member.generation;
    }
    const postListTuples = await this.postQueryRepository.getPostList(memberId, sortPostList, sortBy, memberGeneration);
    const totalCount = await this.postQueryRepository.getAllPostListTotalCount(memberId, sortPostList, sortBy, memberGeneration);

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


  private async saveHashTags(postId: number, hashTags: HashTagDto[]): Promise<void> {
    await Promise.all(hashTags.map(async (hashTagDto) => {
      let hashTagInfo = await this.hashTagRepository.findOneBy({ tagName: hashTagDto.tagName, color: hashTagDto.color });

      if (!hashTagInfo) {
        hashTagInfo = await this.hashTagRepository.save({
          tagName: hashTagDto.tagName,
          color: hashTagDto.color,
        });
      }
      await this.postHashTagRepository.save({
        postId: postId,
        hashTagId: hashTagInfo.id,
      });
    }));
  }
}