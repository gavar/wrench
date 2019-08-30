import { ReleaseType } from "../types";

const releaseTypes: Record<ReleaseType, ReleaseType> = {
  major: "major",
  minor: "minor",
  patch: "patch",
};

/**
 * Convert value to a release type if possible.
 * @param value - value to convert.
 */
export function asReleaseType(value: string | ReleaseType): ReleaseType | undefined {
  return releaseTypes[value as ReleaseType];
}
