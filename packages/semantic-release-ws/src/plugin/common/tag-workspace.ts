import { Context, tag } from "@wrench/semantic-release";
import { Signale } from "signale";
import { Workspace } from "../../types";
import { createWorkspaceLogger } from "../../util";

export function warnNoGitTag(logger: Signale, dryRun: boolean, git: boolean, gitTag: string): boolean {
  if (dryRun) logger.warn(`Skip '${gitTag}' tag creation in dry-run mode`);
  else if (!git) logger.warn(`Skip '${gitTag}' tag creation since git disabled`);
  else return false;
  return true;
}

export function warnNoGitPush(logger: Signale, dryRun: boolean, git: boolean): boolean {
  if (dryRun) logger.warn(`Skip 'git push' in dry-run mode`);
  else if (git === false) logger.warn(`Skip 'git push' since git disabled`);
  else return false;
  return true;
}

export async function tagWorkspace(workspace: Workspace, owner: Context) {
  const {env} = owner;
  const {nextRelease, cwd} = workspace;
  const {dryRun, git} = workspace.options;
  const logger = createWorkspaceLogger(workspace, owner);
  if (!warnNoGitTag(logger, dryRun, git, nextRelease.gitTag)) {
    await tag(nextRelease, {cwd, env});
    logger.success(`Created tag '${nextRelease.gitTag}'`);
  }
}
