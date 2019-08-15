import { Signale } from "signale";
import { Branch } from "./branch";
import { Options } from "./cli";
import { Commit } from "./commit";
import { Release, ReleaseNotes } from "./release";

export interface Context {
  /** Working directory. */
  cwd: string;
  env: NodeJS.ProcessEnv;
  stdout: NodeJS.WriteStream;
  stderr: NodeJS.ReadStream;
  logger: Signale;
  options: Options;
  branches: Branch[];
  branch: Branch;
}

/** Context provided for {@link Plugin#verifyConditions} step. */
export interface VerifyConditionsContext extends Context {

}

/** Context provided for {@link Plugin#analyzeCommits} step. */
export interface AnalyzeCommitsContext extends VerifyConditionsContext {
  lastRelease: Release;
  releases: Release[];
  commits: Commit[];
}

/** Context provided for {@link Plugin#verifyRelease} step. */
export interface VerifyReleaseContext extends AnalyzeCommitsContext {
  nextRelease: Release;
}

/** Context provided for {@link Plugin#generateNotes} step. */
export interface GenerateNotesContext extends VerifyReleaseContext {

}

/** Context provided for {@link Plugin#prepare} step. */
export interface PrepareContext extends GenerateNotesContext {
  nextRelease: ReleaseNotes;
}

/** Context provided for {@link Plugin#publish} step. */
export interface PublishContext extends PrepareContext {

}

/** Context provided for {@link Plugin#success} step. */
export interface SuccessContext extends PublishContext {

}
