import { PrepareContext } from "@wrench/semantic-release";
import execa from "execa";
import { move } from "fs-extra";
import path from "path";
import { NpmConfig } from "./types";

export async function pack(config: NpmConfig, context: PrepareContext) {
  if (config.tarballDir) {
    const {pkgRoot, tarballDir} = config;
    const {cwd, logger, nextRelease, env} = context;
    const basePath = pkgRoot ? path.resolve(cwd, pkgRoot) : cwd;

    logger.log("Creating npm package version %s", nextRelease.version);
    const proc = execa("npm", ["pack", basePath], {cwd, env});
    proc.stdout.pipe(context.stdout, {end: false});
    proc.stderr.pipe(context.stderr, {end: false});

    const tarball = (await proc).stdout.split("\n").pop();
    const src = path.resolve(cwd, tarball);
    const dst = path.resolve(cwd, tarballDir.trim(), tarball);
    if (src !== dst)
      await move(src, dst, {overwrite: true});
  }
}
