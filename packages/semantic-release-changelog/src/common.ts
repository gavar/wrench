import cp from "child_process";
import { promisify } from "util";
import { ChangelogConfig } from "./types";

const exec = promisify(cp.exec);

export const DEFAULT_CONFIG: Partial<ChangelogConfig> = {
  changelogFile: "CHANGELOG.md",
};

export async function checkout(hash: string, filename: string) {
  try {
    await exec(`git checkout ${hash} -- ${filename}`);
  } catch (e) {
    if (!e.stderr.includes("did not match any file(s) known to git"))
      throw e;
  }
}
