import { ApiProperty } from '@nestjs/swagger';
import { EmojiType } from 'src/entity/common/Enums';

export class EmojiListResponse {
  @ApiProperty({ enum: EmojiType, enumName: 'EmojiCode' })
  emojiCode!: EmojiType
  @ApiProperty()
  emojiCount!: number;
  @ApiProperty()
  isClicked!: boolean;
  constructor(emojiCode: EmojiType, emojiCount: number, isClicked: boolean) {
    this.emojiCode = emojiCode;
    this.emojiCount = emojiCount;
    this.isClicked = isClicked;
  }
}
