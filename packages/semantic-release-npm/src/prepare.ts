import { PrepareContext } from "@wrench/semantic-release";
import { existsSync, unlinkSync } from "fs";
import { resolve } from "path";
import { NpmConfig, readPack, resolveTarballName } from "./common";

const execute = require("@semantic-release/npm/lib/prepare");

export async function prepare(config: NpmConfig, context: PrepareContext) {
  const {tarballDir} = config;
  if (tarballDir) {
    const pack = await readPack(context.cwd);
    const tarball = resolveTarballName(pack.name, pack.version);
    const tarballPath = resolve(context.cwd, tarballDir, tarball);
    if (existsSync(tarballPath)) {
      // BUG: `@semantic-release/npm` throws an error if tarball already exists
      context.logger.warn("removing previous tarball: %s", tarballPath);
      unlinkSync(tarballPath);
    }
  }
  // BUG: run directly, verification logic of `semantic-release/npm` is broken
  return execute(config, context);
}
