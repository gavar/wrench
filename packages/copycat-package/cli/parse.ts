import yargs, { Arguments, Argv } from "yargs";

/**
 * List of parameters available to be configured by CLI.
 */
export interface RunProps {
  /**
   * Whether to search for `package.json` recursively.
   * Does not traverse modules directories, such as:
   * - node_modules
   * @default false
   */
  recurse?: boolean;
}

export function parse(): Arguments<RunProps> {
  return (yargs as Argv<RunProps>)
    .option("recurse", {type: "boolean", alias: "r", default: false})
    .help()
    .argv;
}
