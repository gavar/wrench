import { Branch, getLastRelease, getReleaseChannel, makeTag, Package } from "@wrench/semantic-release";
import { LastRelease } from "@wrench/semantic-release/src";

/**
 * Resolve last release information for the provided context.
 * Fallbacks to package version if no related tag found.
 */
export function resolveLastRelease(branch: Branch, tagFormat: string, pack: Package): LastRelease {
  const release = getLastRelease(branch, tagFormat);

  // use version from package
  if (!release.version) {
    release.version = pack.version;
    release.channel = getReleaseChannel(release.version);
    release.name = makeTag(tagFormat, release.version, release.channel);
  }

  return release;
}
