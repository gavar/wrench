export type ReleaseType = "major" | "minor" | "patch";

export interface Release {
  type: ReleaseType;
  name: string;
  channel: string;
  version: string;
  gitHead: string;
  gitTag: string;
  url: string;
}

export interface ReleaseNotes extends Release {
  notes: string;
}
