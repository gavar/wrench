import { getNextVersion, makeTag, Release, ReleaseType } from "@wrench/semantic-release";
import { lt } from "semver";
import { Signale } from "signale";
import { Workspace } from "../../types";

export function resolveNextRelease({branch, options: {tagFormat}, lastRelease}: Workspace, type: ReleaseType, logger: Signale): Release {
  const next = {type} as Release;
  if (type) {
    next.channel = branch.channel;
    next.version = getNextVersion(branch, type, next.channel, lastRelease, logger);
    next.gitTag = makeTag(tagFormat, next.version, next.channel);
    next.name = makeTag(tagFormat, next.version);

    if (lastRelease.channel == next.channel)
      if (lt(next.version, lastRelease.version)) {
        logger.error("excluding release since next version", next.version,
          "is less than last version", lastRelease.version,
          "on same channel", lastRelease.channel || "",
        );
        next.type = void 0;
      }
  }

  // TODO: validate?
  return next;
}
