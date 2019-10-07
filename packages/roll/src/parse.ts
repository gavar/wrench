import { RollupConfig } from "./types";

const {mergeOptions} = require("rollup/dist/shared");

/**
 * Parse input properties from `rollup` raw cli arguments.
 * @param command - raw cli arguments.
 */
export function parseCommand(command: Record<string, unknown>): RollupConfig {
  const {inputOptions, outputOptions} = mergeOptions({command});
  const config: RollupConfig = Object.assign({}, inputOptions);
  config.output = outputOptions;
  return config;
}
