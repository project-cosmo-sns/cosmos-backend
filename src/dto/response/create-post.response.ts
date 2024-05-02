import { ApiProperty } from '@nestjs/swagger';

export class CreatePostResponse {
  @ApiProperty()
  postId!: number;
  constructor(postId: number) {
    this.postId = postId;
  }
}