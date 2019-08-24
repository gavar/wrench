import cp from "child_process";
import { promisify } from "util";

const exec = promisify(cp.exec);

export interface YarnWorkspacesInfo {
  [name: string]: YarnWorkspaceInfo;
}

export interface YarnWorkspaceInfo {
  location: string;
  workspaceDependencies: string[];
  mismatchedWorkspaceDependencies: string[];
}

export async function yarnWorkspacesInfo(): Promise<YarnWorkspacesInfo> {
  const args = ["yarn", "workspaces", "info", "--json"];
  const raw = await exec(args.join(" "));
  const json = JSON.parse(raw.stdout);
  return JSON.parse(json.data);
}
