import { Context, Options } from "../types";

const $ = require("semantic-release/lib/get-config");

interface GetConfigResult {
  options: Options;
  plugins: unknown[];
  pluginsPath: unknown;
}

export function getConfig(context: Context, options?: Options): GetConfigResult {
  return $(context, options);
}
