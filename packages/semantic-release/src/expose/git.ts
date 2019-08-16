import { Options } from "execa";
import { Release } from "../types";

const git = require("semantic-release/lib/git");

export function tag(release: Release, options?: Options) {
  return git.tag(release, options);
}
