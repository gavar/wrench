import {
  Branch,
  Commit,
  LastRelease,
  Options,
  Package,
  Plugins,
  Release,
  ReleaseNotes,
  ReleaseType,
  Step,
} from "@wrench/semantic-release";

export interface CommonOptions extends Options {
  /**
   * Whether to allow running git commands making modifications to a repository.
   * @default true
   */
  git: boolean;

  /**
   * Commands to execute along with a step.
   * Similar to {@link https://www.npmjs.com/package/@semantic-release/exec @semantic-release/exec}.
   */
  exec: WorkspaceExecHooks;

  /**
   * Conventional Changelog preset.
   * @see {@link https://www.npmjs.com/package/@semantic-release/commit-analyzer @semantic-release/commit-analyzer}
   * @see {@link https://github.com/conventional-changelog/conventional-changelog conventional-changelog}
   */
  preset: "angular" | "atom" | "codemirror" | "ember" | "eslint" | "express" | "jquery" | "jshint";

  /** Explicitly define next version or release type, skipping commits history analysis. */
  forceRelease: string | ReleaseType;

  /** Reduce release type be not greater than the given value. */
  reduceReleaseType: ReleaseType;
}

export type WorkspaceExecHookType = "pre" | "post";
export type WorkspaceExecHooks = Record<Step, Partial<Record<WorkspaceExecHookType, string>>>;

/**
 * Set of workplace packages.
 * Key: name of the package: {@link Package#name}, [@link Workspace#name}
 */
export type WorkspacePackages = Record<string, Partial<CommonOptions>>;

export type WsConfiguration<P = {}> = CommonOptions & P & {
  /** Set to automatically confirm all prompts. */
  confirm?: boolean;

  /** Common options for all workspaces. */
  workspace?: Partial<CommonOptions & P>;

  /** Options for particular package. */
  packages?: WorkspacePackages;
}

export interface Workspace {
  /** Path to the workspace root. */
  cwd: string;

  /** Name of the workspace package. */
  name: string;

  /** Workspace package information. */
  pack: Package;

  /** Options provided by the workspace `.releaserc` config. */
  options: CommonOptions;

  /** Workspace plugins. */
  plugins: Plugins;

  /**
   * Commits related to modification of files withing workspace.
   * @see AnalyzeCommitsContext#commits
   */
  commits: Commit[];

  /**
   * Current release branch.
   * @see Context#branch.
   */
  branch: Branch;

  /**
   * List of all release branches.
   * @see Context#branches.
   */
  branches: Branch[];

  /**
   * Last release of this workspace.
   * @see AnalyzeCommitsContext#lastRelease
   */
  lastRelease: LastRelease;

  /**
   * Next release of this workspace.
   * @see VerifyReleaseContext#nextRelease
   */
  nextRelease: Release & Partial<ReleaseNotes>;
}

/** Project information. */
export interface Project {
  /** Project root path. */
  cwd: string;

  /** List of project workspaces. */
  workspaces: Workspace[];

  /** Map where key is a tag name and value is its commit hash. */
  tagsRefs: Record<string, string>;

  /** Tags of the current branch. */
  branchTags: string[];
}

/**
 * Projects information shared in a process.
 */
export interface Projects {
  /**
   * Project instance by path.
   * @see {@link Context#cwd};
   */
  [cwd: string]: Project;
}
