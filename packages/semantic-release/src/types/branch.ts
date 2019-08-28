import { ReleaseType } from "./release";

export interface Branch {
  name: string;
  type: string;
  range: string;
  tags: Tag[];
  prerelease: string;
  channel?: string;
  accept?: ReleaseType[];
}

export interface Tag {
  version: string;
  channel: string;
  gitTag: string;
  gitHead: string;
}
