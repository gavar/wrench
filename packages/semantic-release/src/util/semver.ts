import { prerelease, ReleaseType } from "semver";
import { ReleaseType as SemanticReleaseType } from "../types";

const releaseTypes: Record<ReleaseType, SemanticReleaseType> = {
  major: "major",
  minor: "minor",
  patch: "patch",
  premajor: "major",
  preminor: "minor",
  prepatch: "patch",
  prerelease: "patch",
};

/**
 * Convert semantic release type from semver release type.
 * @param value - value to convert.
 */
export function semverToReleaseType(value: string | ReleaseType): SemanticReleaseType | undefined {
  return releaseTypes[value as ReleaseType];
}

/**
 * Check if provided value is a semver release type.
 * @param value - value to check.
 */
export function isSemverReleaseType(value: string | ReleaseType): value is ReleaseType {
  return value && releaseTypes.hasOwnProperty(value);
}

/**
 * Get first prerelease component from the version.
 * @param version - version to parse.
 */
export function getReleaseChannel(version: string): string | undefined {
  const pre = prerelease(version);
  if (pre && pre.length)
    return pre[0];
}