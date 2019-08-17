import { Context, tag } from "@wrench/semantic-release";
import { Signale } from "signale";
import { CommonOptions, Workspace } from "../../types";
import { createWorkspaceLogger } from "../../util";

export function warnNotCreatingTag(workspace: Workspace, owner: Context): boolean {
  const logger = createWorkspaceLogger(workspace, owner);
  const {gitTag} = workspace.nextRelease;
  const {dryRun, git} = workspace.options;
  if (dryRun) logger.warn(`Skip '${gitTag}' tag creation in dry-run mode`);
  else if (!git) logger.warn(`Skip '${gitTag}' tag creation since git disabled`);
  else return false;
  return true;
}

export function warnNoGitPush(options: CommonOptions, logger: Signale): boolean {
  if (options.dryRun) logger.warn(`Skip 'git push' in dry-run mode`);
  else if (options.git === false) logger.warn(`Skip 'git push' since git disabled`);
  else return false;
  return true;
}

export async function tagWorkspace(workspace: Workspace, owner: Context) {
  const {logger, env} = owner;
  const {nextRelease, cwd} = workspace;
  if (!warnNotCreatingTag(workspace, owner)) {
    await tag(nextRelease, {cwd, env});
    logger.success(`Created tag '${nextRelease.gitTag}'`);
  }
}
