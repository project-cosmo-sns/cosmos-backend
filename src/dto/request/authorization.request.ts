import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class AuthorizationRequest {
  @ApiProperty()
  @IsNumber()
  generation!: number;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  imageUrl!: string;

  constructor(generation: number, name: string, imageUrl: string) {
    this.generation = generation;
    this.name = name;
    this.imageUrl = imageUrl;
  }
}