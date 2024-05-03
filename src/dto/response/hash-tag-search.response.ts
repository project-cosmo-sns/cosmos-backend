import { ApiProperty } from "@nestjs/swagger";
import { GetHashTagSearch } from "../get-hash-tag-search.dto";

export class HashTagSearchResponse {
  @ApiProperty()
  tagName!: string;
  @ApiProperty()
  color!: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }

  static from(getHashTagSearch: GetHashTagSearch[]) {
    return getHashTagSearch.map(
      (hashTags) =>
        new HashTagSearchResponse(
          hashTags.tagName,
          hashTags.color,
        )
    );
  }
}