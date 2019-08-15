/* eslint-disable @typescript-eslint/no-require-imports */
import { Release, VerifyReleaseContext } from "@wrench/semantic-release";
import { Workspace } from "../../types";
import { createWorkspaceContext } from "../../util";

const getNextVersion = require("semantic-release/lib/get-next-version");
const {makeTag} = require("semantic-release/lib/utils");

export function resolveNextRelease(workspace: Workspace, owner: VerifyReleaseContext): Release {
  let {nextRelease} = workspace;
  if (nextRelease.type) {
    const context = createWorkspaceContext(workspace, owner);
    const {tagFormat} = context.options;
    nextRelease = context.nextRelease = {...owner.nextRelease, ...nextRelease};
    nextRelease.version = getNextVersion(context);
    nextRelease.gitTag = makeTag(tagFormat, nextRelease.version, nextRelease.channel);
    nextRelease.name = makeTag(tagFormat, nextRelease.version);
  }
  // TODO: validate?
  return nextRelease;
}
