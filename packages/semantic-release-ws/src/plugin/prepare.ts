import { PrepareContext } from "@wrench/semantic-release";
import { Workspace, WsConfiguration } from "../types";
import { callWorkspacesOf, createWorkspaceContext, WorkspacesHooks } from "../util";

const tag = require("semantic-release/lib/git");

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function prepare(config: WsConfiguration, context: PrepareContext) {
  return callWorkspacesOf("prepare", context, hooks);
}

const hooks: WorkspacesHooks<"prepare"> = {
  async postProcessWorkspace(workspace: Workspace, output: never, owner: PrepareContext) {
    const {logger} = owner;
    const {cwd, env} = createWorkspaceContext(workspace, owner);
    const {nextRelease} = workspace;
    if (workspace.options.dryRun) {
      owner.logger.warn(`Skip ${nextRelease.gitTag} tag creation in dry-run mode`);
    } else {
      await tag(nextRelease, {cwd, env});
      logger.success(`Created tag ${nextRelease.gitTag}`);
    }
  },
};
