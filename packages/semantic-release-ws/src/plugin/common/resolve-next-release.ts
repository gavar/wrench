import { asReleaseType, Branch, getNextVersion, makeTag, Release, ReleaseType } from "@wrench/semantic-release";
import { noop } from "lodash";
import { lte, parse, valid } from "semver";
import { Signale } from "signale";
import { Workspace } from "../../types";

const stub = {log: noop} as Signale;

export function resolveNextRelease(workspace: Workspace, type: ReleaseType, logger: Signale): Release {
  const {branch, options: {tagFormat, forceRelease}, lastRelease} = workspace;

  const next = {
    type: asReleaseType(forceRelease) || type || void 0,
    channel: branch.channel,
  } as Release;

  if (next.type) {
    const manual = valid(forceRelease);
    next.version = lastRelease && lastRelease.version
      ? manual
        ? getManualVersion(branch, manual)
        : getNextVersion(branch, lastRelease, next, stub)
      : workspace.package.version;

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

  if (next.type)
    logger.log("The next release version is %s", next.version);

  return next;
}

function getManualVersion(branch: Branch, version: string) {
  if (branch.type === "prerelease") {
    const {major, minor, patch, prerelease} = parse(version);
    const channel = prerelease && prerelease[0] || void 0;
    if (channel !== branch.channel)
      version = `${major}.${minor}.${patch}-${branch.prerelease}.${1}`;
  }
  return version;
}
