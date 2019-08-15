import { ReleaseType } from "@wrench/semantic-release";
import { Workspace } from "../../types";

/**
 * Show table of release types per workspace.
 * @param workspaces - workspaces to include into a summary.
 * @param releaseType - final release type being used as an output value.
 */
export function showReleaseTypesSummary(workspaces: Workspace[], releaseType: ReleaseType): void {
  const rows = workspaces.map(w => [w.name, w.nextRelease.type]);
  rows.push(["~", releaseType]);
  const table = rows.map(t => ({
    "name": t[0],
    "release-type": t[1],
  }));
  console.table(table);
}
