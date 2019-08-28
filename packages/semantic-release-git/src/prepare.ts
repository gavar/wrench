import { PrepareContext } from "@wrench/semantic-release";
import { template } from "lodash";
import { warnNoGitCommit } from "./common";
import { GitConfig } from "./types";

const glob = require("@semantic-release/git/lib/glob-assets");
const resolveConfig = require("@semantic-release/git/lib/resolve-config");
const {filterModifiedFiles, add, commit} = require("@semantic-release/git/lib/git");

export async function prepare(config: GitConfig, context: PrepareContext) {
  const {env, cwd, options: {dryRun}, branch, lastRelease, nextRelease, logger} = context;
  const {message, assets} = resolveConfig(config, logger);

  if (assets && assets.length > 0) {
    let files = await glob(context, assets);
    files = await filterModifiedFiles(files, {cwd, env});
    if (files.length > 0) {
      const msg = message
        ? template(message)({branch, lastRelease, nextRelease})
        : `chore(release): ${nextRelease.gitTag}`;
      logger.log("%d files to commit >> %s", files.length, msg);
      if (!warnNoGitCommit(logger, dryRun, config.git)) {
        await add(files, {env, cwd});
        await commit(msg, {env, cwd});
      }
    }
  }

  // NOTE: don't waste time pushing since it's done by semantic-release after prepare
}

