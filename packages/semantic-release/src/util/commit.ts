import { relative } from "path";
import { Commit } from "../types";
import { git } from "./git";

/** Extra properties for the particular {@link Commit}. */
export interface CommitProps {
  /** Files associated with the commit. */
  files: string[];
}

/**
 * Cache of the extra properties of {@link Commit}.
 * Key: {@link Commit#hash}
 */
const commitCache: Record<string, Partial<CommitProps>> = {};

/**
 * Safely get property from {@link commitCache} for the commit.
 * @param commit - commit to get property for.
 * @param key - name of the property to get.
 */
export function commitGet<K extends keyof CommitProps>(commit: Commit, key: K): CommitProps[K] {
  if (commitCache[commit.hash])
    return commitCache[commit.hash][key];
}

/**
 * Safely set property in {@link commitCache} for the commit.
 * @param commit - commit to set property for.
 * @param key - name of the property to set.
 * @param value - value of the property to set.
 */
export function commitSet<K extends keyof CommitProps>(commit: Commit, key: K, value: CommitProps[K]): void {
  commitCache[commit.hash] = commitCache[commit.hash] || {};
  commitCache[commit.hash][key] = value;
}

/**
 * Run {@link updateCommitFiles} for those commit that haven't got files yet.
 * @param commits - commits to check.
 */
export async function initializeCommitsFiles(commits: Commit[]) {
  commits = commits.filter(x => !commitGet(x, "files"));
  await Promise.all(commits.map(updateCommitFiles));
}

/** Resolve commit files from GIT log. */
export async function updateCommitFiles(commit: Commit): Promise<string[]> {
  const files = await git.filesByCommit(commit.hash);
  commitSet(commit, "files", files);
  return files;
}

/**
 * Pick only those commits that relates to provided context.
 * @param commits - list of all commits.
 * @param path - path to directory to use as commit filter.
 */
export function ownCommits(commits: Commit[], path: string): Commit[] {
  const rel = relative(process.cwd(), path).split("\\").join("/") + "/";
  return commits.filter(commit => isOwnCommit(commit, rel));
}

function isOwnCommit(commit: Commit, path: string): boolean {
  for (const file of commitGet(commit, "files"))
    if (file.startsWith(path))
      return true;
}
