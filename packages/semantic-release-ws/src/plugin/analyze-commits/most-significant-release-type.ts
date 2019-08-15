import { ReleaseType } from "@wrench/semantic-release";

/**
 * Select most significant release type form the provided values.
 * @param releaseTypes - release types to choose from.
 */
export function mostSignificantReleaseType(releaseTypes: ReleaseType[]): ReleaseType {
  let max = 0;
  let major: ReleaseType;
  for (const releaseType of releaseTypes)
    if (releaseTypeWeights[releaseType] > max)
      max = releaseTypeWeights[major = releaseType];
  return major;
}

export const releaseTypeWeights: Record<ReleaseType, number> = {
  patch: 1,
  minor: 2,
  major: 3,
};
