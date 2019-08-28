import { ReleaseType } from "./release";

export interface Branch {
  name: string;
  type: BranchType;
  range: string;
  tags: Tag[];
  prerelease: string;
  channel?: string;
  accept?: ReleaseType[];
}

export type BranchType = "maintenance" | "release" | "prerelease";

export interface Tag {
  version: string;
  channel: string;
  gitTag: string;
  gitHead: string;
}
