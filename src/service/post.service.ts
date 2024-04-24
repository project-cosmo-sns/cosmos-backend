import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashTagDto } from 'src/dto/hash-tag-dto';
import { PostPostInfoDto } from 'src/dto/post-post-dto';
import { HashTag } from 'src/entity/hash_tag.entity';
import { Member } from 'src/entity/member.entity';
import { Post } from 'src/entity/post.entity';
import { PostHashTag } from 'src/entity/post_hash_tag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Member) private readonly memberRepository: Repository<Member>,
    @InjectRepository(HashTag) private readonly hashTagRepository: Repository<HashTag>,
    @InjectRepository(PostHashTag) private readonly postHashTagRepository: Repository<PostHashTag>,
  ) { }

  async postPost(memberId: number, dto: PostPostInfoDto): Promise<void> {
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

  private async saveHashTags(postId: number, hashTags: HashTagDto[]): Promise<void> {
    await Promise.all(hashTags.map(async (hashTagDto) => {
      let hashTagInfo = await this.hashTagRepository.findOneBy({ tagName: hashTagDto.tagName, color: hashTagDto.color });

      if (!hashTagInfo) {
        hashTagInfo = await this.hashTagRepository.save({
          tagName: hashTagDto.tagName,
          color: hashTagDto.color,
        });
      }
      console.log(`postId: ${postId}`);
      await this.postHashTagRepository.save({
        postId: postId,
        hashTagId: hashTagInfo.id,
      });
    }));
  }
}