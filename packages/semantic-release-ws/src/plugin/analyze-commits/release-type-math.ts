import { ReleaseType } from "@wrench/semantic-release";

/**
 * Select most significant release type form the provided values.
 * @param releaseTypes - release types to choose from.
 */
export function selectMaxReleaseType(releaseTypes: ReleaseType[]): ReleaseType {
  let v = Number.NEGATIVE_INFINITY;
  let max: ReleaseType;
  for (const releaseType of releaseTypes)
    if (releaseType && releaseTypeWeights[releaseType] > v)
      v = releaseTypeWeights[max = releaseType];
  return max;
}

/**
 * Select most insignificant release type form the provided values.
 * @param releaseTypes - release types to choose from.
 */
export function selectMinReleaseType(releaseTypes: ReleaseType[]): ReleaseType {
  let v = Number.POSITIVE_INFINITY;
  let min: ReleaseType;
  for (const releaseType of releaseTypes)
    if (releaseType && releaseTypeWeights[releaseType] < v)
      v = releaseTypeWeights[min = releaseType];
  return min;
}

export const releaseTypeWeights: Record<ReleaseType, number> = {
  patch: 1,
  minor: 2,
  major: 3,
};
