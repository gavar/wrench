/**
 * Plugin configuration options.
 * @see https://www.npmjs.com/package/@semantic-release/changelog#options @semantic-release/changelog
 */
export interface ChangelogConfig {
  /** File path of the changelog. */
  changelogFile: string;

  /** Title of the changelog file (first line of the file). */
  changelogTitle: boolean;

  /** Whether to purge changelog file. */
  regenerateNotes: boolean;
}
