import { prerelease } from "semver";

/**
 * Get first prerelease component from the version.
 * @param version - version to parse.
 */
export function getReleaseChannel(version: string): string | undefined {
  const pre = prerelease(version);
  if (pre && pre.length)
    return pre[0];
}
