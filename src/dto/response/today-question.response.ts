import { ApiProperty } from '@nestjs/swagger';

export class TodayQuestionResponse {
  @ApiProperty()
  postId!: number;
  @ApiProperty()
  question!: string;

  constructor(postId: number, question: string) {
    this.postId = postId;
    this.question = question;
  }
}