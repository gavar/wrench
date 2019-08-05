import { pick } from "lodash";
import { InputOptions } from "rollup";

/**
 * Parse input properties from `rollup` raw cli arguments.
 * @param cli - raw cli arguments.
 */
export function parseCLI(cli: Record<string, unknown>): InputOptions {
  return pick(cli,
    "preserveModules",
  ) as any;
}
