import { each } from "@emulsy/async";
import {
  AnalyzeCommitsContext,
  Branch,
  Commit,
  getTags,
  ReleaseNotes,
  ReleaseType,
  updateCommitFiles,
} from "@wrench/semantic-release";
import { Workspace, WsConfiguration } from "../../types";
import { callWorkspacesOf, WorkspacesHooks } from "../../util";
import { mostSignificantReleaseType } from "./most-significant-release-type";
import { ownCommits } from "./own-commits";
import { resolveLastRelease } from "./resolve-last-release";
import { showReleaseTypesSummary } from "./show-release-types-summary";

const SHOW_SUMMARY = false;

export async function analyzeCommits(config: WsConfiguration, context: AnalyzeCommitsContext): Promise<ReleaseType> {
  context.logger.start("resolving commit files");
  await each(context.commits, updateCommitFiles);
  return callWorkspacesOf("analyzeCommits", context, hooks);
}

const hooks: WorkspacesHooks<"analyzeCommits"> = {
  preProcessWorkspace: async function (w: Workspace, owner: AnalyzeCommitsContext) {
    const {env, cwd} = owner;
    const {tagFormat} = w.options;

    // update last release
    w.commits = owner.commits;
    w.branches = await getTags(cwd, env, tagFormat, owner.branches);
    w.branches.forEach(fixTags);
    w.branch = w.branches.find(nameEqual, owner.branch.name);
    w.lastRelease = resolveLastRelease(w.branch, tagFormat, w.package);

    // should analyze only commits since last release
    if (w.lastRelease.gitHead)
      w.commits = w.commits.slice(0, w.commits.findIndex(hashEqual, w.lastRelease.gitHead));

    // use only commits that affecting workspace
    w.commits = ownCommits(w.commits, w.cwd);
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
  // inherit channel from the branch itself
  for (const tag of branch.tags)
    if (tag.channel === void 0)
      tag.channel = branch.channel;
}

function hashEqual(this: string, commit: Commit) {
  return commit.hash === this;
}

function nameEqual(this: string, branch: Branch) {
  return branch.name === this;
}
