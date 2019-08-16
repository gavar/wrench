import { Signale } from "signale";
import { Branch, Release, ReleaseType } from "../types";

const $ = require("semantic-release/lib/get-next-version");

export function getNextVersion(branch: Branch,
                               type: ReleaseType,
                               channel: string,
                               lastRelease: Release,
                               logger: Signale): string {
  return $({branch, nextRelease: {type, channel}, lastRelease, logger});
}
