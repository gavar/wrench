import SemanticReleaseError from "@semantic-release/error";
import { keyBy } from "lodash";
import { Workspace, WorkspacePackages, WsConfiguration } from "../../types";

export function verifyWorkspaces(config: WsConfiguration, workspaces: Workspace[]): void {
  const {packages} = config;
  if (packages) {
    workspaces.forEach(w => verifyPackageConfiguration(packages, w));
    verifyNoUnknownPackages(packages, workspaces);
  }
}

export function verifyNoUnknownPackages(packages: WorkspacePackages, workspaces: Workspace[]): void {
  const keys = Object.keys(packages);
  const byName = keyBy(workspaces, "name");
  const unknowns = keys.filter(key => !byName[key]);

  if (unknowns.length)
    throw new SemanticReleaseError(
      `packages contains options for unknown workspaces: ${unknowns.join(" | ")}`,
      "NO_UNKNOWN_PACKAGES",
    );
}

export function verifyPackageConfiguration(packages: WorkspacePackages, workspace: Workspace): void {
  const {name} = workspace;
  if (name in packages && !("release" in workspace.package))
    throw new SemanticReleaseError(
      `package '${name}' explicitly defines configuration, but does not provide 'release' property\n
      set '"release" : true', so semantic-release won't try to recursively load monorepo configuration upwards`,
      "PACKAGE_RELEASE_NOT_DEFINED",
    );
}
