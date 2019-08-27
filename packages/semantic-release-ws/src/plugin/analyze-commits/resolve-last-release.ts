import { Branch, getLastRelease, makeTag, Package, Release } from "@wrench/semantic-release";
import { parse } from "semver";

/**
 * Resolve last release information for the provided context.
 * Fallbacks to package version if no related tag found.
 */
export function resolveLastRelease(branch: Branch, tagFormat: string, pack: Package): Release {
  const release = getLastRelease(branch, tagFormat);
  // use version from package
  if (!release.version) {
    release.version = pack.version;
    release.name = makeTag(tagFormat, release.version, release.channel);
  }

  // resolve channel from version, since pre-release may be on a release branch after merge
  const semver = parse(release.version);
  release.channel = semver.prerelease && semver.prerelease[0] || branch.channel;

  return release;
}
