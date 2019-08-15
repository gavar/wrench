import { exec } from "child_process";
import { which } from "shelljs";
import { promisify } from "util";

const execAsync = promisify(exec);

export namespace yarn {
  /** Check yarn installed. */
  export function is(): boolean {
    return !!which("yarn");
  }

  /** Yarn workspace info. */
  export interface Workspace {
    location: string;
    workspaceDependencies: string[];
    mismatchedWorkspaceDependencies: string[];
  }

  export namespace workspace {
    /** Get Yarn workspaces info. */
    export async function info(): Promise<Record<string, Workspace>> {
      const output = await execAsync("yarn workspaces info");
      const raw = output.stdout.toString();
      const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
      return JSON.parse(json);
    }
  }
}
