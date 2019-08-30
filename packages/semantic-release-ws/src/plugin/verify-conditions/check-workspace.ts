import { AsyncTest, isOwnReleaseConfig, testify } from "@wrench/semantic-release";
import fs from "fs";
import { promisify } from "util";
import { Workspace } from "../../types";

const realpath = promisify(fs.realpath);
const exclusions: AsyncTest<Workspace>[] = [
  [isPrivate, "package is private"],
  [isReleaseFalse, "release is disabled by `release` flag in package.json"],
  [isForeignProject, "real path points outside the working directory."],
  [isNotOwnReleaseConfig, "does not provide own semantic-release configuration"],
];

/**
 * Whether workspace is eligible to be included for further parsing.
 * @param workspace - workspace to check.
 */
export async function checkWorkspace(workspace: Workspace): Promise<true | string> {
  return testify(workspace, exclusions);
}

export function isPrivate(workspace: Workspace): boolean {
  return workspace.pack && workspace.pack.private;
}

export function isReleaseFalse(workspace: Workspace): boolean {
  return workspace.pack.release === false;
}

export async function isNotOwnReleaseConfig(workspace: Workspace): Promise<boolean> {
  return !await isOwnReleaseConfig(workspace.cwd);
}

export async function isForeignProject(workspace: Workspace): Promise<boolean> {
  const cwd = process.cwd();
  const real = await realpath(workspace.cwd);
  return !real.startsWith(cwd);
}
