import { Branch, getLastRelease, makeTag, Package, Release } from "@wrench/semantic-release";

/**
 * Resolve last release information for the provided context.
 * Fallbacks to package version if no related tag found.
 */
export function resolveLastRelease(branch: Branch, tagFormat: string, pack: Package): Release {
  const release = getLastRelease(branch, tagFormat);
  if (!release.version) {
    release.version = pack.version;
    release.channel = branch.channel;
    release.name = makeTag(tagFormat, release.version, release.channel);
  }
  return release;
}
