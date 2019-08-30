import {
  AnalyzeCommitsContext,
  asReleaseType,
  getTags,
  initializeCommitsFiles,
  ownCommits,
  PluginsFunction,
  ReleaseType,
} from "@wrench/semantic-release";
import { Workspace, WsConfiguration } from "../../types";
import { callWorkspacesOf, createWorkspaceLogger, WorkspacesHooks } from "../../util";
import { resolveNextRelease } from "../common";
import { selectMaxReleaseType, selectMinReleaseType } from "./release-type-math";
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
    w.lastRelease = resolveLastRelease(w.branch, tagFormat, w.pack);

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
    const version = workspace.options.forceRelease;
    if (version != null) {
      logger.info("skipping commits analysis since next version defined explicitly:", version);
      return asReleaseType(version) || "manual" as ReleaseType;
    }
    return plugin(context);
  },

  postProcessWorkspace(workspace: Workspace, type: ReleaseType, owner: AnalyzeCommitsContext) {
    const logger = createWorkspaceLogger(workspace, owner);
    workspace.nextRelease = resolveNextRelease(workspace, type, logger);
  },

  /** @inheritdoc */
  processWorkspaceOutput(releaseType: ReleaseType, workspace: Workspace, owner: AnalyzeCommitsContext): ReleaseType {
    // const {maxReleaseType} = workspace.options;
    if (releaseType && !isManual(releaseType)) {
      const min = selectMinReleaseType([releaseType, workspace.options.reduceReleaseType]);
      if (min !== releaseType) {
        const logger = createWorkspaceLogger(workspace, owner);
        logger.warn(`reducing '${releaseType}' release type since it's limited to be as maximum '${min}'`);
        releaseType = min;
      }
    }
    return releaseType;
  },

  /** @inheritdoc */
  processWorkspacesOutputs(releaseTypes: ReleaseType[]): ReleaseType {
    // use only patch release type to increment global version
    // as it's used only to avoid analyzing whole repository history
    if (releaseTypes.some(isManual) || selectMaxReleaseType(releaseTypes))
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
