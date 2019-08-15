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

/** Resolve commit files from GIT log. */
export async function updateCommitFiles(commit: Commit): Promise<string[]> {
  const files = await git.filesByCommit(commit.hash);
  commitSet(commit, "files", files);
  return files;
}
