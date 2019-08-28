import cp from "child_process";
import { promisify } from "util";
import { ChangelogConfig } from "./types";

// const readFileAsync = promisify(readFile);
const exec = promisify(cp.exec);

export const DEFAULT_CONFIG: Partial<ChangelogConfig> = {
  changelogFile: "CHANGELOG.md",
};

export async function checkout(hash: string, filename: string) {
  await exec(`git checkout ${hash} -- ${filename}`);
}
