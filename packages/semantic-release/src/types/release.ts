export type ReleaseType = "major" | "minor" | "patch";

export interface LastRelease {
  name: string;
  channel: string;
  version: string;
  gitHead: string;
  gitTag: string;
}

export interface Release extends LastRelease {
  type: ReleaseType;
  url: string;
}

export interface ReleaseNotes extends Release {
  notes: string;
}
