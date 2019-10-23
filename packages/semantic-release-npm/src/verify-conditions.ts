import $ from "@semantic-release/npm";
import { PublishContext } from "@wrench/semantic-release";
import path from "path";
import rc from "rc";
import { NpmConfig } from "./types";

export async function verifyConditions(config: NpmConfig, context: PublishContext) {
  useNpmConfig(context);
  await $.verifyConditions(config, context);
}

function useNpmConfig(context: PublishContext) {
  const {cwd} = context;
  if (!context.env.NPM_CONFIG_USERCONFIG) {
    const {config} = rc("npm", null, {config: path.resolve(cwd, ".npmrc")});
    context.env.NPM_CONFIG_USERCONFIG = config;
  }
}
