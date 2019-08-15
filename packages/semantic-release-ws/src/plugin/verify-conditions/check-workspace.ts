import { AsyncTest, isOwnReleaseConfig, testify } from "@wrench/semantic-release";
import { Workspace } from "../../types";

const exclusions: AsyncTest<Workspace>[] = [
  [isPrivate, "package is private"],
  [isReleaseFalse, "release is disabled by `release` flag in package.json"],
  [isExternalReleaseConfig, "does not provide own semantic-release configuration"],
];

/**
 * Whether workspace is eligible to be included for further parsing.
 * @param workspace - workspace to check.
 */
export async function checkWorkspace(workspace: Workspace): Promise<true | string> {
  return testify(workspace, exclusions);
}

export function isPrivate(workspace: Workspace): boolean {
  return workspace.package && workspace.package.private;
}

export function isReleaseFalse(workspace: Workspace): boolean {
  return workspace.package.release === false;
}

export async function isExternalReleaseConfig(workspace: Workspace): Promise<boolean> {
  return !await isOwnReleaseConfig(workspace.cwd);
}
