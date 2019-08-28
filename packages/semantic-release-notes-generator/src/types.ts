/**
 * @see {@link https://www.npmjs.com/package/@semantic-release/release-notes-generator#options release-notes-generator#options}
 */
export interface NotesGeneratorConfig {

  /**
   * 'conventional-changelog' preset.
   * @see https://github.com/conventional-changelog/conventional-changelog conventional-changelog
   * @default "angular"
   */
  preset: "angular" | "atom" | "codemirror" | "ember" | "eslint" | "express" | "jquery" | "jshint" | string;

  /**
   * NPM package name of a custom 'conventional-changelog' preset.
   * @see https://github.com/conventional-changelog/conventional-changelog conventional-changelog
   */
  config: string;

  /**
   * Additional 'conventional-commits-parser' options that will extends the ones loaded by preset or config. This is convenient to use a 'conventional-changelog' preset with some customizations without having to create a new module.
   * @see https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#conventionalcommitsparseroptions conventional-commits-parser options
   */
  parserOpts: unknown;

  /**
   * Additional `conventional-commits-writer` options that will extends the ones loaded by preset or config. This is convenient to use a 'conventional-changelog' preset with some customizations without having to create a new module.
   * @see {@link https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#options conventional-commits-writer options}
   */
  writerOpts: unknown;

  /**
   * The host used to generate links to issues and commits.
   * @see https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#host conventional-changelog-writer#host.
   * @default {@link https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#repositoryurl repository.url}
   */
  host: string;

  /**
   * Whether to include a link to compare changes since previous release in the release note.
   * @default true
   */
  linkCompare: boolean;

  /**
   * Whether to include a link to issues and commits in the release note.
   * @default true
   * @see https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#linkreferences conventional-changelog-writer#linkreferences
   */
  linkReferences: boolean;

  /**
   * Keyword used to generate commit links.
   * @see https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#commit conventional-changelog-writer#commit
   * @default "commit" | "commits"
   */
  commit: string;

  /**
   * Keyword used to generate issue links.
   * @see https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#issue conventional-changelog-writer#issue
   * @default: "issue" | "issues"
   */
  issue: string;

  /**
   * Additional configuration passed to the 'conventional-changelog' preset.
   * @see https://github.com/conventional-changelog/conventional-changelog-config-spec/tree/master/versions
   */
  presetConfig: unknown;

  /** Whether to fully regenerate release notes from the very beginning. */
  regenerateNotes: boolean;
}
