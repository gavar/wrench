import { AnalyzeCommitsContext, Commit, commitGet } from "@wrench/semantic-release";
import { relative } from "path";

/**
 * Pick only those commits that relates to provided context.
 * @param context - context defining package root path: {@link AnalyzeCommitsContext#cwd}.
 */
export function ownCommitsOf(context: AnalyzeCommitsContext): Commit[] {
  return ownCommits(context.commits, context.cwd);
}

/**
 * Pick only those commits that relates to provided context.
 * @param commits - list of all commits.
 * @param path - path to package to use as commit filter.
 */
export function ownCommits(commits: Commit[], path: string): Commit[] {
  const rel = relative(process.cwd(), path).split("\\").join("/");
  return commits.filter(isOwnCommit, `${rel}/`);
}

function isOwnCommit(this: string, commit: Commit): boolean {
  const files = commitGet(commit, "files");
  return !!files.find(startsWith, this);
}

function startsWith(this: string, file: string): boolean {
  return file.startsWith(this);
}
