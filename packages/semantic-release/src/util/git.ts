import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export namespace git {
  /**
   * Resolve files committed by the commit with specified hash.
   * @param hash - commit hash value.
   */
  export async function filesByCommit(hash: string): Promise<string[]> {
    const raw = await execAsync(`git diff-tree --no-commit-id --name-only -r ${hash}`);
    const rows = raw.stdout.split("\n");
    return rows.map(normalize);
  }
}

function normalize(file: string): string {
  return file.trim().split("\\").join("/");
}
