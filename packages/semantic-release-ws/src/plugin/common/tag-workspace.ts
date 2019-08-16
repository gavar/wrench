import { Context, tag } from "@wrench/semantic-release";
import { Workspace } from "../../types";
import { createWorkspaceContext } from "../../util";

export async function tagWorkspace(workspace: Workspace, owner: Context) {
  const {logger} = owner;
  const {cwd, env} = createWorkspaceContext(workspace, owner);
  const {nextRelease} = workspace;
  if (workspace.options.dryRun) {
    owner.logger.warn(`Skip '${nextRelease.gitTag}' tag creation in dry-run mode`);
  } else {
    await tag(nextRelease, {cwd, env});
    logger.success(`Created tag '${nextRelease.gitTag}'`);
  }
}
