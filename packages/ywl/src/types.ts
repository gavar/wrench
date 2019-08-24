/** NPM package json structure. */
export interface Package {
  name: string;
  dependencies: DependencyGroup;
  devDependencies: DependencyGroup;
  workspaces: PackageWorkspaces;
}

export interface PackageWorkspaces {
  packages: string[]
}

export interface DependencyGroup {
  [name: string]: string;
}
