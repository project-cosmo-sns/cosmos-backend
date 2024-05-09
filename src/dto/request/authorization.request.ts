import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class AuthorizationRequest {
  @ApiProperty()
  @IsNumber()
  generation!: number;

  @ApiProperty()
  @IsString()
  imageUrl!: string;

  constructor(generation: number, imageUrl: string) {
    this.generation = generation;
    this.imageUrl = imageUrl;
  }
}