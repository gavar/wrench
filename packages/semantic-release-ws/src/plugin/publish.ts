import { getGitHead, PublishContext, push, Release } from "@wrench/semantic-release";
import { CommonOptions, Workspace, WsConfiguration } from "../types";
import { callWorkspacesOf, createWorkspaceLogger, WorkspacesHooks } from "../util";
import { tagWorkspace, warnNoGitPush } from "./common";

export async function publish(input: WsConfiguration, context: PublishContext) {
  return callWorkspacesOf("publish", context, hooks);
}

const hooks: WorkspacesHooks<"publish"> = {
  async preProcessWorkspaces(workspaces: Workspace[], owner: PublishContext) {
    // HEAD may change since `semantic-release` commit and push changes just before release
    const {cwd, env} = owner;
    const head = await getGitHead({cwd, env});
    for (const workspace of workspaces)
      workspace.nextRelease.gitHead = head;
  },

  async postProcessWorkspace(workspace: Workspace, output: never, owner: PublishContext) {
    await tagWorkspace(workspace, owner);
  },

  processWorkspacesOutputs(releases: Release[][]): void | false | Release {
    if (releases && releases.length) {
      const flat = releases.flat().filter(hasReleaseType);
      // `allowPublishReleaseArray` hotfix allows to return array
      return flat.length && flat as any;
    }
  },

  /** Push workspaces tags and changes to remote repository. */
  postProcessWorkspaces(workspaces: Workspace[], outputs: never, output: never, owner: PublishContext): Promise<unknown> {
    if (warnNoGitPush(owner.logger, owner.options.dryRun, (owner.options as CommonOptions).git))
      return;

    const {env} = owner;
    const pending = [];
    const repos = new Set<string>();

    // push distinct remotes
    for (const workspace of workspaces) {
      const {options, cwd} = workspace;
      const {repositoryUrl} = options;
      if (!repos.has(repositoryUrl) && repos.add(repositoryUrl))
        if (!warnNoGitPush(createWorkspaceLogger(workspace, owner), options.dryRun, options.git))
          pending.push(push(repositoryUrl, {cwd, env}));
    }

    return Promise.all(pending);
  },
};

function hasReleaseType(release: Release): boolean {
  return !!release.type;
}
