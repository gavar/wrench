import { PrepareContext } from "@wrench/semantic-release";
import { existsSync, unlinkSync } from "fs";
import { resolve } from "path";
import { NpmConfig, readPack, resolveTarballName } from "./common";

const execute = require("@semantic-release/npm/lib/prepare");

export async function prepare(config: NpmConfig, context: PrepareContext) {
  const {tarballDir} = config;
  const {cwd, nextRelease} = context;
  if (tarballDir) {
    const pack = await readPack(cwd);
    const tarball = resolveTarballName(pack.name, nextRelease.version);
    const tarballPath = resolve(cwd, tarballDir, tarball);
    if (existsSync(tarballPath)) {
      // BUG: `@semantic-release/npm` throws an error if tarball already exists
      context.logger.warn("removing previous tarball: %s", tarballPath);
      unlinkSync(tarballPath);
    }
  }
  // BUG: run directly, verification logic of `semantic-release/npm` is broken
  return execute(config, context);
}
