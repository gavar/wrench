import { Context, packageByPath } from "@wrench/semantic-release";
import { join } from "path";
import { Workspace } from "../../types";
import { createWorkspace } from "../../util";

export async function loadWorkspace(name: string, location: string, owner: Context): Promise<Workspace> {
  const workspace = createWorkspace(owner, name, location);
  await loadPackage(workspace);
  return workspace;
}

async function loadPackage(workspace: Workspace): Promise<void> {
  const file = join(workspace.cwd, "package.json");
  workspace.package = await packageByPath(file);
}
