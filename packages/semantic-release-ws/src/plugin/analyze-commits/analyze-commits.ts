import {
  AnalyzeCommitsContext,
  Branch,
  Commit,
  getTags,
  initializeCommitsFiles,
  ownCommits,
  ReleaseType,
} from "@wrench/semantic-release";
import { Workspace, WsConfiguration } from "../../types";
import { callWorkspacesOf, createWorkspaceLogger, WorkspacesHooks } from "../../util";
import { resolveNextRelease } from "../common";
import { mostSignificantReleaseType } from "./most-significant-release-type";
import { resolveLastRelease } from "./resolve-last-release";
import { showReleaseTypesSummary } from "./show-release-types-summary";

const SHOW_SUMMARY = false;

export async function analyzeCommits(config: WsConfiguration, context: AnalyzeCommitsContext): Promise<ReleaseType> {
  context.logger.start("resolving commit files");
  await initializeCommitsFiles(context.commits);
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
    if (w.lastRelease.gitHead) {
      // workspace tag may be excluded by global release tag, so check it's there
      const last = w.commits.findIndex(hashEqual, w.lastRelease.gitHead) + 1;
      if (last > 0) w.commits = w.commits.slice(0, last);
    }

    // use only commits that affecting workspace
    w.commits = ownCommits(w.commits, w.cwd);
  },

  postProcessWorkspace(workspace: Workspace, type: ReleaseType, owner: AnalyzeCommitsContext) {
    const logger = createWorkspaceLogger(workspace, owner);
    workspace.nextRelease = resolveNextRelease(workspace, type, logger);
  },

  /** @inheritdoc */
  processWorkspacesOutputs(releaseTypes: ReleaseType[]): ReleaseType {
    // use only patch release type to increment global version
    // as it's used only to avoid analyzing whole repository history
    const major = mostSignificantReleaseType(releaseTypes);
    return major ? "patch" : undefined;
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
