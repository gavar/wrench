import { Context, packageByPath, Release } from "@wrench/semantic-release";
import { join } from "path";
import { parse } from "semver";

const base = require("semantic-release/lib/get-last-release");

/**
 * Resolve last release information for the provided context.
 * Fallbacks to package version if no related tag found.
 */
export async function getLastRelease(context: Context): Promise<Release> {
  const release: Release = base(context);
  // use package.json version as initial
  if (!release.version) {
    const pkg = await packageByPath(join(context.cwd, "package.json"));
    if (pkg.version) {
      release.version = pkg.version;
      const {prerelease} = parse(pkg.version);
      if (prerelease.length)
        release.channel = prerelease[0].toString();
    }
  }
  return release;
}
