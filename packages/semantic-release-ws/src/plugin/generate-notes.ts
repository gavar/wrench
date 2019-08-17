import { GenerateNotesContext } from "@wrench/semantic-release";
import { Workspace, WsConfiguration } from "../types";
import { callWorkspacesOf, createWorkspaceLogger, WorkspacesHooks } from "../util";
import { warnNoGitTag } from "./common";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function generateNotes(config: WsConfiguration, context: GenerateNotesContext) {
  return callWorkspacesOf("generateNotes", context, hooks);
}

const hooks: WorkspacesHooks<"generateNotes"> = {
  async postProcessWorkspace(workspace: Workspace, notes: string, owner: GenerateNotesContext) {
    const {options, nextRelease} = workspace;
    const logger = createWorkspaceLogger(workspace, owner);
    nextRelease.notes = notes;
    // notify here since "prepare" step is skipped in a dry run mode.
    warnNoGitTag(logger, options.dryRun, options.git, nextRelease.gitTag);
  },

  processWorkspacesOutputs(notes: string[], workspaces: Workspace[]): string {
    notes = workspaces.map((w, i) => toReleaseNotes(w, notes[i]));
    return notes.join("\n\n");
  },
};

function toReleaseNotes(workspace: Workspace, notes: string): string {
  const lines = notes.trim().split("\n");
  const h1 = lines.findIndex(x => x.startsWith("# "));
  if (h1 >= 0) lines[h1] = `# ${workspace.name} ${lines[h1].substring(2)}`;
  else lines.unshift(`# ${workspace.name}`);
  return lines.join("\n");
}
