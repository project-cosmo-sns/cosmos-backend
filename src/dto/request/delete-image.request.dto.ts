import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteImageRequestDto {
  @IsNotEmpty()
  @IsString()
  imageUrl: string;
}
