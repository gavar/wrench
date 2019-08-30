import { Branch, LastRelease } from "../types";

const $ = require("semantic-release/lib/get-last-release");

export function getLastRelease(branch: Branch, tagFormat: string): LastRelease {
  return $({branch, options: {tagFormat}});
}
