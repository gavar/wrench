import { Branch, Commit, Options, Package, Plugins, Release, ReleaseNotes } from "@wrench/semantic-release";

export interface CommonOptions extends Options {

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
  preset: "angular" | "angular" | "atom" | "codemirror" | "ember" | "eslint" | "express" | "jquery" | "jshint";

  /**
   * Message for the release commit.
   * @see {@link https://www.npmjs.com/package/@semantic-release/git @semantic-release/git}
   */
  message: string;

  /**
   * Whether to publish the npm package to the registry.
   * @see {@link https://www.npmjs.com/package/@semantic-release/npm @semantic-release/npm}
   */
  npmPublish: boolean;
}

export type WorkspaceExecHookType = "pre" | "post";
export type WorkspaceExecHooks = Record<Step, Partial<Record<WorkspaceExecHookType, string>>>;

/**
 * Set of workplace packages.
 * Key: name of the package: {@link Package#name}, [@link Workspace#name}
 */
export type WorkspacePackages = Record<string, Partial<CommonOptions>>;

export interface WsConfiguration extends CommonOptions {
  /** Set to automatically confirm all prompts. */
  confirm?: boolean;

  /** Common options for all workspaces. */
  workspace?: Partial<CommonOptions>;

  /** Options for particular package. */
  packages?: WorkspacePackages;
}

export interface Workspace {
  /** Path to the workspace root. */
  cwd: string;

  /** Name of the workspace package. */
  name: string;

  /** Workspace package information. */
  package: Package;

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
  lastRelease: Release;

  /**
   * Next release of this workspace.
   * @see VerifyReleaseContext#nextRelease
   */
  nextRelease: ReleaseNotes;
}

/** Project information. */
export interface Project {
  /** Project root path. */
  cwd: string;

  /** List of project workspaces. */
  workspaces: Workspace[];
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
