import { getNextVersion, makeTag, Release, ReleaseType, asReleaseType } from "@wrench/semantic-release";
import { noop } from "lodash";
import { lte, valid } from "semver";
import { Signale } from "signale";
import { Workspace } from "../../types";

const stub = {log: noop} as Signale;

export function resolveNextRelease({branch, options: {tagFormat, forceRelease}, lastRelease}: Workspace, type: ReleaseType, logger: Signale): Release {
  type = asReleaseType(forceRelease) || type || void 0;
  const version = valid(forceRelease);

  const next = {
    type,
    channel: branch.channel,
  } as Release;

  if (type) {
    // resolve next version
    if (version) {
      if (branch.type === "prerelease") {
        next.version = getNextVersion(branch, null, next.channel, {...lastRelease, version}, stub);
        next.version = next.version.replace("null", version);
      } else {
        next.version = version;
      }
      logger.log("The next release version is %s", next.version);
    } else {
      next.version = getNextVersion(branch, type, next.channel, lastRelease, logger);
    }

    // rest fields
    next.gitTag = makeTag(tagFormat, next.version, next.channel);
    next.name = makeTag(tagFormat, next.version);

    // validate
    if (lastRelease.channel == next.channel)
      if (lte(next.version, lastRelease.version)) {
        logger.error("excluding release since next version", next.version,
          "is less than or equal to last version", lastRelease.version,
          "on same channel", lastRelease.channel || "",
        );
        next.type = void 0;
      }
  }

  // TODO: validate?
  return next;
}
