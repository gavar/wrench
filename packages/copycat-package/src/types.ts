/** Structure of `package.json` which copies properties of other packages. */
export interface CopycatPackage extends Package {
  /** Defines properties to copy. */
  copycat: CopycatPackageProps;
}

export interface CopycatPackageProps {
  /** Repository properties to copy into {@link Package#repository}. */
  repository: string | PackageRepository;
  /** Dependencies copy into {@link Package#dependencies} */
  dependencies: CopycatDependencyGroup;
  /** Development dependencies to copy into {@link Package#devDependencies} */
  devDependencies: CopycatDependencyGroup;
  /** Peer dependencies to copy into {@link Package#peerDependencies} */
  peerDependencies: CopycatDependencyGroup;
}

/** Group where each key defines source of the version for the particular dependency. */
export interface CopycatDependencyGroup {
  /**
   * @param name - name of the dependency within this package.
   * @return path to a source package from which to copy dependency version.
   */
  [name: string]: string;
}

/**
 * NPM package json structure.
 * @see https://docs.npmjs.com/files/package.json
 */
export interface Package {
  /** @see https://docs.npmjs.com/files/package.json#name */
  name: string;
  /** @see https://docs.npmjs.com/files/package.json#version */
  version: string;
  /** @see https://docs.npmjs.com/files/package.json#repository */
  repository: string | PackageRepository;
  /** @see https://docs.npmjs.com/files/package.json#dependencies */
  dependencies: DependencyGroup;
  /** @see https://docs.npmjs.com/files/package.json#devdependencies */
  devDependencies: DependencyGroup;
  /** @see https://docs.npmjs.com/files/package.json#peerdependencies */
  peerDependencies: DependencyGroup;
  /** Dependencies that may be referenced by other packages in order to share dependency versions. */
  commonDependencies: DependencyGroup;
}

/** @see https://docs.npmjs.com/files/package.json#repository */
export interface PackageRepository {
  type?: string;
  url?: string;
  directory?: string;
}

export interface DependencyGroup {
  [name: string]: string;
}

export type DependencyGroupType =
  | "dependencies"
  | "devDependencies"
  | "peerDependencies";
