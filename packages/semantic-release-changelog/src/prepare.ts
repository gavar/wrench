import { PrepareContext } from "@wrench/semantic-release";
import { existsSync, unlinkSync } from "fs";
import { defaults } from "lodash";
import { join } from "path";
import { checkout, DEFAULT_CONFIG } from "./common";
import { ChangelogConfig } from "./types";

const $prepare = require("@semantic-release/changelog/lib/prepare");

export async function prepare(config: ChangelogConfig, context: PrepareContext) {
  defaults(config, DEFAULT_CONFIG);
  const {changelogFile, regenerateNotes} = config;
  const {cwd, lastRelease} = context;

  const filename = join(cwd, changelogFile);
  const hash = lastRelease.gitTag || lastRelease.gitHead;

  if (hash && !regenerateNotes)
    await checkout(hash, filename);
  else if (existsSync(filename))
    unlinkSync(filename);

  return $prepare(config, context);
}









