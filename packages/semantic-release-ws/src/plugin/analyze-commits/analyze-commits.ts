import {
  AnalyzeCommitsContext,
  getTags,
  initializeCommitsFiles,
  ownCommits,
  PluginsFunction,
  ReleaseType,
  semverToReleaseType,
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
    w.branch = w.branches.find(x => x.name === owner.branch.name);
    w.lastRelease = resolveLastRelease(w.branch, tagFormat, w.package);

    // should analyze only commits since last release
    if (w.lastRelease.gitHead) {
      // workspace tag may be excluded by global release tag, so check it's there
      const last = w.commits.findIndex(x => x.hash === w.lastRelease.gitHead) + 1;
      if (last > 0) w.commits = w.commits.slice(0, last);
    }

    // use only commits that affecting workspace
    w.commits = ownCommits(w.commits, w.cwd);
  },

  callWorkspace(plugin: PluginsFunction<"analyzeCommits">, context: AnalyzeCommitsContext, workspace: Workspace, owner: AnalyzeCommitsContext) {
    const {logger} = context;
    const {version} = workspace.options;
    if (version != null) {
      logger.info("skipping commits analysis since next version defined explicitly:", version);
      return semverToReleaseType(version) || "manual" as ReleaseType;
    }
    return plugin(context);
  },

  postProcessWorkspace(workspace: Workspace, type: ReleaseType, owner: AnalyzeCommitsContext) {
    const logger = createWorkspaceLogger(workspace, owner);
    workspace.nextRelease = resolveNextRelease(workspace, type, logger);
  },

  /** @inheritdoc */
  processWorkspacesOutputs(releaseTypes: ReleaseType[]): ReleaseType {
    // use only patch release type to increment global version
    // as it's used only to avoid analyzing whole repository history
    if (releaseTypes.some(isManual) || mostSignificantReleaseType(releaseTypes))
      return "patch";
  },

  /** @inheritdoc */
  postProcessWorkspaces(workspaces: Workspace[], releaseTypes: ReleaseType[], releaseType: ReleaseType) {
    if (SHOW_SUMMARY)
      showReleaseTypesSummary(workspaces, releaseType);
  },
};

function isManual(value: string): boolean {
  return value === "manual";
}
