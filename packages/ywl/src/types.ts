/** NPM package json structure. */
export interface Package {
  workspaces: PackageWorkspaces;
}

export interface PackageWorkspaces {
  packages: string[]
}
