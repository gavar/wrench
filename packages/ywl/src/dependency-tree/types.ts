export interface DependencyNode {
  /** Name of the package. */
  name: string;

  /** Path to a package file. */
  filename: string;

  /** Package dependencies. */
  dependencies?: DependencyNode[];

  /** Package dev dependencies. */
  devDependencies?: DependencyNode[];
}
