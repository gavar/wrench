import { PrepareContext } from "@wrench/semantic-release";
import execa from "execa";
import path from "path";
import { NpmConfig } from "./types";

export async function version(config: NpmConfig, context: PrepareContext) {
  const {pkgRoot} = config;
  const {cwd, logger, nextRelease, env} = context;
  const basePath = pkgRoot ? path.resolve(cwd, pkgRoot) : cwd;

  logger.log("Write version %s to package.json in %s", nextRelease.version, basePath);
  const args = ["version", nextRelease.version, "--no-git-tag-version", "--allow-same-version"];
  const proc = execa("npm", args, {cwd: basePath, env});
  proc.stdout.pipe(context.stdout, {end: false});
  proc.stderr.pipe(context.stderr, {end: false});
  return proc;
}
