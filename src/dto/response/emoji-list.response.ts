import { ApiProperty } from '@nestjs/swagger';

export class EmojiListResponse {
  @ApiProperty()
  emojiCount!: number;
  @ApiProperty()
  isClicked!: boolean;
  constructor(emojiCount: number, isClicked: boolean) {
    this.emojiCount = emojiCount;
    this.isClicked = isClicked;
  }
}
