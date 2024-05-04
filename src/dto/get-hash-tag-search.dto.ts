import { GetHashTagSearchTuple } from "src/repository/post.query-repository";

export class GetHashTagSearch {
  tagName!: string;
  color!: string;
  constructor(tagName: string, color: string) {
    this.tagName = tagName;
    this.color = color;
  }

  static from(tuple: GetHashTagSearchTuple) {
    return new GetHashTagSearch(tuple.tagName, tuple.color);
  }
}
