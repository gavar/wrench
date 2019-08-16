import { getNextVersion, makeTag, Release, VerifyReleaseContext } from "@wrench/semantic-release";
import { Workspace } from "../../types";
import { createWorkspaceLogger } from "../../util";

export function resolveNextRelease(w: Workspace, owner: VerifyReleaseContext): Release {
  let {nextRelease} = w;
  if (nextRelease.type) {
    const {tagFormat} = w.options;
    const logger = createWorkspaceLogger(w, owner);
    nextRelease = {...owner.nextRelease, ...nextRelease};
    nextRelease.version = getNextVersion(w.branch, nextRelease.type, nextRelease.channel, w.lastRelease, logger);
    nextRelease.gitTag = makeTag(tagFormat, nextRelease.version, nextRelease.channel);
    nextRelease.name = makeTag(tagFormat, nextRelease.version);
  }
  // TODO: validate?
  return nextRelease;
}
