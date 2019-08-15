export interface BranchOption {
  name: string;
  prerelease: boolean;
}

export type BranchOptionType = string | BranchOption;

export interface Options {
  extends: string | string[];
  branches: BranchOptionType | BranchOptionType[];
  repositoryUrl: string;
  tagFormat: string;
  plugins: (string | [string, object])[];
  dryRun: boolean;
  ci: boolean;
  debug: boolean;
}
