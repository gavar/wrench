import { VerifyReleaseContext } from "@wrench/semantic-release";
import { Workspace, WsConfiguration } from "../../types";
import { askToContinue, callWorkspacesOf, shouldAskToContinue, WorkspacesHooks } from "../../util";
import { releaseSummary } from "./release-summary";

export async function verifyRelease(options: WsConfiguration, context: VerifyReleaseContext) {
  const outputs = await callWorkspacesOf("verifyRelease", context, hooks);
  if (shouldAskToContinue(options)) await askToContinue();
  return outputs;
}

const hooks: WorkspacesHooks<"verifyRelease"> = {
  async preProcessWorkspace(workspace: Workspace, owner: VerifyReleaseContext) {
    const {nextRelease} = workspace;
    nextRelease.url = owner.nextRelease.url;
    nextRelease.gitHead = owner.nextRelease.gitHead;
  },

  postProcessWorkspaces(workspaces: Workspace[]) {
    console.log(releaseSummary(workspaces));
  },
};
