import { Branch, getLastRelease, getReleaseChannel, Package } from "@wrench/semantic-release";
import { LastRelease } from "@wrench/semantic-release/src";

/**
 * Resolve last release information for the provided context.
 * Fallbacks to package version if no related tag found.
 */
export function resolveLastRelease(branch: Branch, tagFormat: string, pack: Package): LastRelease {
  const release = getLastRelease(branch, tagFormat);
  if (!release.version) {
    release.version = pack.version;
    release.channel = getReleaseChannel(pack.version);
  }
  return release;
}
