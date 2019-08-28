import { Options } from "execa";
import { Commit, Release } from "../types";

const git = require("semantic-release/lib/git");

export function tag(release: Release, options?: Options): Promise<void> {
  return git.tag(release, options);
}

export function push(url: string, options?: Options): Promise<void> {
  return git.push(url, options);
}

export function getGitHead(options: Options): Promise<string> {
  return git.getGitHead(options);
}

export function getCommits(from: string, to: string, options: Options): Promise<Commit[]> {
  return git.getCommits(from, to, options);
}
