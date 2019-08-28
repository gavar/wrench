import { Commit, getCommits, initializeCommitsFiles } from "@wrench/semantic-release";
import { Signale } from "signale";

let history: Commit[];

/** Lazily fetch GIT commit history. */
export async function lazyHistory(logger: Signale): Promise<Commit[]> {
  if (!history) {
    logger.start("fetching commit history");
    history = await getCommits(void 0, "HEAD", {
      cwd: process.cwd(),
      env: {},
    });
    await initializeCommitsFiles(history);
  }
  return history;
}
