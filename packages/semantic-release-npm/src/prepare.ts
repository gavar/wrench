import { PrepareContext } from "@wrench/semantic-release";
import { existsSync, unlink } from "fs";
import { resolve } from "path";
import { promisify } from "util";
import { NpmConfig, readPack, resolveTarballName } from "./common";

const unlinkAsync = promisify(unlink);
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
      await unlinkAsync(tarballPath);
    }
  }
  // BUG: run directly, verification logic of `semantic-release/npm` is broken
  return execute(config, context);
}
