import { Options } from "execa";
import { Release } from "../types";

const git = require("semantic-release/lib/git");

export function tag(release: Release, options?: Options): Promise<void> {
  return git.tag(release, options);
}

export function push(url: string, options?: Options): Promise<void> {
  return git.push(url, options);
}
