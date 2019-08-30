import { Signale } from "signale";
import { Branch, Release } from "../types";

const $ = require("semantic-release/lib/get-next-version");

export function getNextVersion(branch: Branch,
                               lastRelease: Pick<Release, "version" | "channel">,
                               nextRelease: Pick<Release, "type" | "channel">,
                               logger: Signale): string {
  return $({
    branch,
    nextRelease,
    lastRelease,
    logger,
  });
}
