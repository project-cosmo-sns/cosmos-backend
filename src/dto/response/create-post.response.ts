import { ApiProperty } from '@nestjs/swagger';

export class CreatePostResponse {
  @ApiProperty()
  id!: number;
  constructor(id: number) {
    this.id = id;
  }
}
