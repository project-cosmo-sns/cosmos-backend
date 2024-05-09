import { ApiProperty } from '@nestjs/swagger';

export class TodayQuestionResponse {
  @ApiProperty()
  postId!: number;
  @ApiProperty()
  title!: string;

  constructor(postId: number, title: string) {
    this.postId = postId;
    this.title = title;
  }
}