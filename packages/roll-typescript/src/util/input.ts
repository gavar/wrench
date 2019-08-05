import { InputOption } from "rollup";

/**
 * Convert {@link InputOption} to array of paths.
 * @param input - input to convert.
 */
export function arrifyInput(input: InputOption): string[] {
  if (typeof input === "object")
    return Object.values(input);

  if (Array.isArray(input))
    return input;

  if (typeof input === "string")
    return [input];
}
