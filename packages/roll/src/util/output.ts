import path from "path";
import { OutputOptions } from "rollup";

/**
 * Create output options.
 * @param file - output file name.
 * @param modular - whether project is {@link InputOptions.preserveModules modular}.
 * @param output - output options.
 */
export function output(file: string, modular: boolean, output: OutputOptions): OutputOptions {
  if (modular) output.dir = path.dirname(file);
  else output.file = path.normalize(file);
  return output;
}
