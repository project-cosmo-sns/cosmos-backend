import { ApiProperty } from "@nestjs/swagger";
import { GetHashTagSearch } from "../get-hash-tag-search.dto";

export class HashTagSearchResponse {
  @ApiProperty({ isArray: true })
  tagName!: string;
  constructor(tagName: string) { this.tagName = tagName; }

  static from(getHashTagSearch: GetHashTagSearch[]) {
    return getHashTagSearch.map(
      (hashTags) =>
        new HashTagSearchResponse(
          hashTags.tagName
        )
    );
  }
}