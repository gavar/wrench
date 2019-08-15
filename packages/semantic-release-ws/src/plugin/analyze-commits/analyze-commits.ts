import { each } from "@emulsy/async";
import { AnalyzeCommitsContext, Branch, ReleaseNotes, ReleaseType, updateCommitFiles } from "@wrench/semantic-release";
import { Workspace, WsConfiguration } from "../../types";
import { callWorkspacesOf, createWorkspaceContext, WorkspacesHooks } from "../../util";
import { getLastRelease } from "./get-last-release";
import { mostSignificantReleaseType } from "./most-significant-release-type";
import { ownCommitsOf } from "./own-commits-of";
import { showReleaseTypesSummary } from "./show-release-types-summary";

const SHOW_SUMMARY = false;
const getTags = require("semantic-release/lib/branches/get-tags");

export async function analyzeCommits(config: WsConfiguration, context: AnalyzeCommitsContext): Promise<ReleaseType> {
  context.logger.start("resolving commit files");
  await each(context.commits, updateCommitFiles);
  return callWorkspacesOf("analyzeCommits", context, hooks);
}

const hooks: WorkspacesHooks<"analyzeCommits"> = {
  async preProcessWorkspace(w: Workspace, owner: AnalyzeCommitsContext) {
    const c = createWorkspaceContext(w, owner);
    w.branches = c.branches = await getTags(c, owner.branches);
    w.branches.forEach(fixTags);
    w.branch = c.branch = c.branches.find(b => b.name === owner.branch.name);
    w.lastRelease = c.lastRelease = await getLastRelease(c);

    // only consider commits since last release
    if (w.lastRelease) {
      const index = c.commits.findIndex(x => x.hash === w.lastRelease.gitHead);
      if (index >= 0) c.commits = c.commits.slice(0, index);
    }

    // use only commits that belong to the particular package
    w.commits = c.commits = ownCommitsOf(c);
  },

  postProcessWorkspace(workspace: Workspace, type: ReleaseType, owner: AnalyzeCommitsContext) {
    // always override owner release
    workspace.nextRelease = {} as ReleaseNotes;
    if (type) workspace.nextRelease.type = type;
  },

  /** @inheritdoc */
  processWorkspacesOutputs(releaseTypes: ReleaseType[]): ReleaseType {
    return mostSignificantReleaseType(releaseTypes);
  },

  /** @inheritdoc */
  postProcessWorkspaces(workspaces: Workspace[], releaseTypes: ReleaseType[], releaseType: ReleaseType) {
    if (SHOW_SUMMARY)
      showReleaseTypesSummary(workspaces, releaseType);
  },
};

function fixTags(branch: Branch) {
  for (const tag of branch.tags)
    if (tag.channel === void 0)
      tag.channel = branch.channel;
}
