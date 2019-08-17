import { Signale } from "signale";

export function warnNoGitCommit(logger: Signale, dryRun: boolean, git: boolean): boolean {
  if (dryRun) logger.warn(`skip 'git commit' in dry-run mode`);
  else if (git === false) logger.warn(`skip 'git commit' since git disabled`);
  else return false;
  return true;
}
