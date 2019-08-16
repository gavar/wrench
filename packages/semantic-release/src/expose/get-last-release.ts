import { Branch, Release } from "../types";

const $ = require("semantic-release/lib/get-last-release");

export function getLastRelease(branch: Branch, tagFormat: string): Release {
  return $({branch, options: {tagFormat}});
}
