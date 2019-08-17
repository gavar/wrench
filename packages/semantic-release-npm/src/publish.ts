import { verifyConditions } from "@semantic-release/npm";
import { Package, PublishContext } from "@wrench/semantic-release";
import execa from "execa";
import { join } from "path";
import { NpmConfig, readPack, resolveTarballName } from "./common";

const getChannel = require("@semantic-release/npm/lib/get-channel");
const getRegistry = require("@semantic-release/npm/lib/get-registry");
const getReleaseInfo = require("@semantic-release/npm/lib/get-release-info");

export async function publish(config: NpmConfig, context: PublishContext) {
  // verify just before publish to avoid unnecessary verifications
  await verifyConditions(config, context);

  const dryRun = context.options.dryRun || config.npmPublish === false;
  const packDir = join(context.cwd, config.pkgRoot || "");
  const pack = await readPack(packDir);
  let path = packDir;

  // publish existing tarball when `tarballDir`
  if (config.tarballDir) {
    const tarball = resolveTarballName(pack.name, pack.version);
    path = join(config.tarballDir, tarball);
  }

  return execute(path, dryRun, config.access, pack, context);
}

export async function execute(path: string, dryRun: boolean, access: string, pack: Package, context: PublishContext) {
  const {cwd, env, stdout, stderr, nextRelease: {version, channel}, logger} = context;
  if (pack.private !== true) {
    const registry = getRegistry(pack, context);
    const distTag = getChannel(channel);
    const mode = dryRun ? "in a dry run mode" : "";

    logger.log(`Publishing version ${version} to npm registry on dist-tag ${distTag}`, mode);
    const args = ["publish", path, "--tag", distTag, "--registry", registry];
    if (access) args.push("--access", access);
    if (dryRun) args.push("--dry-run");

    const proc = execa("npm", args, {cwd, env});
    proc.stdout.pipe(stdout, {end: false});
    proc.stderr.pipe(stderr, {end: false});
    await proc;

    logger.log(`Published ${pack.name}@${version} to ${registry}`, mode);
    return getReleaseInfo(pack, context, distTag, registry);
  }

  logger.log(`Skip publishing to npm registry as package.json's private property is ${pack.private}`);
  return false;
}
