import { GetHashTagSearchTuple } from "src/repository/post.query-repository";

export class GetHashTagSearch {
  tagName!: string;
  constructor(tagName: string) { this.tagName = tagName; }

  static from(tuple: GetHashTagSearchTuple) {
    return new GetHashTagSearch(tuple.tagName);
  }
}
