export interface NpmConfig {
  /**
   * Directory path to publish.
   * @see {@link https://www.npmjs.com/package/@semantic-release/npm @semantic-release/npm}
   */
  pkgRoot: string;

  /**
   * Whether to publish the npm package to the registry.
   * @see {@link https://www.npmjs.com/package/@semantic-release/npm @semantic-release/npm}
   */
  npmPublish: boolean;

  /**
   * Directory path in which to write the the package tarball.
   * @see {@link https://www.npmjs.com/package/@semantic-release/npm @semantic-release/npm}
   */
  tarballDir: string;

  /**
   * Tells the registry whether this package should be published as public or restricted.
   * @see https://docs.npmjs.com/cli/publish#description
   */
  access: "public" | "restricted";
}
