export interface GitConfig {
  /**
   * Whether to allow running git commands making modifications to a repository.
   * @default true
   */
  git: boolean;

  /**
   * Message for the release commit.
   * @see {@link https://www.npmjs.com/package/@semantic-release/git @semantic-release/git}
   */
  message: string;

  /**
   * Files to include in the release commit.
   * @see {@link https://www.npmjs.com/package/@semantic-release/git @semantic-release/git}
   */
  assets: false | string[];
}
