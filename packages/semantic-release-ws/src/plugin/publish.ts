import { PublishContext, Release } from "@wrench/semantic-release";
import { WsConfiguration } from "../types";
import { callWorkspacesOf, WorkspacesHooks } from "../util";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
};
