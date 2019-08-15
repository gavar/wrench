import { filter } from "@emulsy/async";
import { Context } from "@wrench/semantic-release";
import { Workspace, WsConfiguration } from "../../types";
import { yarn } from "../../util";
import { checkWorkspace } from "./check-workspace";
import { loadWorkspace } from "./load-workspace";
import { verifyWorkspaces } from "./verify-workspaces";

/** Resolve workspaces for the provided context using. */
export async function resolveWorkspaces(config: WsConfiguration, context: Context): Promise<Workspace[]> {
  context.logger.start("resolving workspaces");
  const workspaces = await workspacesByYarn(context);
  verifyWorkspaces(config, workspaces);
  return filter(workspaces, async (workspace) => {
    const success = await checkWorkspace(workspace);
    return success === true || void context.logger.warn(`excluding workspace '${workspace.name}': ${success}`);
  });
}

/**
 * Resolve workspaces for the provided context using `yarn`.
 * @param context - context containing workspaces.
 */
async function workspacesByYarn(context: Context): Promise<Workspace[]> {
  const info = await yarn.workspace.info();
  return Promise.all(Object.entries(info).map(yarnToWorkspace, context));
}

function yarnToWorkspace(this: Context, [key, value]: [string, yarn.Workspace]): Promise<Workspace> {
  return loadWorkspace(key, value.location, this);
}
