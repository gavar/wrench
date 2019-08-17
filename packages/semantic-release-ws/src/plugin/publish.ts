import { PublishContext, push, Release } from "@wrench/semantic-release";
import { CommonOptions, Workspace, WsConfiguration } from "../types";
import { callWorkspacesOf, createWorkspaceLogger, WorkspacesHooks } from "../util";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
import { tagWorkspace, warnNoGitPush } from "./common";

export async function publish(input: WsConfiguration, context: PublishContext) {
  return callWorkspacesOf("publish", context, hooks);
}

const hooks: WorkspacesHooks<"publish"> = {

  async postProcessWorkspace(workspace: Workspace, output: never, owner: PublishContext) {
    await tagWorkspace(workspace, owner);
  },

  processWorkspacesOutputs(releases: Release[][]): void | false | Release {
    if (releases && releases.length) {
      const flat = releases.flat().filter(x => x.type);
      // TODO: normalize to a single Release object
      // `plugin/hotfix` allows to return array
      return flat.length && flat as any;
    }
  },

  /** Push workspaces tags and changes to remote repository. */
  postProcessWorkspaces(workspaces: Workspace[], outputs: never, output: never, owner: PublishContext): Promise<unknown> {
    if (warnNoGitPush(owner.options as CommonOptions, owner.logger))
      return;

    const {env} = owner;
    const pending = [];
    const repos = new Set<string>();

    // push distinct remotes
    for (const workspace of workspaces) {
      const {options, cwd} = workspace;
      const {repositoryUrl} = options;
      if (!repos.has(repositoryUrl) && repos.add(repositoryUrl))
        if (!warnNoGitPush(options, createWorkspaceLogger(workspace, owner)))
          pending.push(push(repositoryUrl, {cwd, env}));
    }

    return Promise.all(pending);
  },
};
