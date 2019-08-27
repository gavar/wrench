import { normalize } from "path";
import { OutputOptions } from "rollup";
import { extname, slash } from "./path";

/**
 * Create output options.
 * @param input - input file name.
 * @param output - output file name.
 * @param modular - whether project is {@link InputOptions.preserveModules modular}.
 * @param options - output options.
 */
export function output(input: string, output: string, modular: boolean, options: OutputOptions): OutputOptions {
  if (modular) options.dir = resolveDir(input, output);
  else options.file = output;
  return options;
}

function resolveDir(input: string, output: string) {
  input = normalize(input);
  output = normalize(output);

  let suffix = "/" + slash(input).split("/").slice(1).join("/");
  suffix = suffix.slice(0, -extname(suffix).length) + extname(output);

  if (slash(output).endsWith(suffix))
    return output.slice(0, -suffix.length);

  throw new Error(`output should have structure '{path}${normalize(suffix)}' since modular project input is '${input}'`);
}
