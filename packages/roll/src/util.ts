import fs from "fs";
import path from "path";
import { Package, PackageDirectories } from "./types";

/** File types to be considered as scripts. */
export const scriptFileTypes: string[] = [".ts", ".js"];

/**
 * Configure default directory structure form the package values.
 * @param pack - `package.json` values.
 */
export function defaultDirectories(pack: Package): PackageDirectories {
  return {
    src: "./src",
    cli: "./cli",
    lib: pack.main && path.dirname(pack.main) || "./",
    bin: "./bin",
    tmp: "./tmp",
  };
}

/**
 * Resolve file path or throw error on failure.
 * @param directory - directory where to search for file.
 * @param basename - name of the file to search for.
 * @param suffixes - suffixes to try while searching for file.
 */
export function resolveThrow(directory: string, basename: string, suffixes: string[] = scriptFileTypes): string {
  const attempts = suffixes.map(suffix => path.resolve(directory, basename) + suffix);
  const filename = attempts.find(fs.existsSync);
  if (filename) return path.relative(process.cwd(), filename);

  const message = `unable to resolve file '${directory}/${basename}'`;
  const details = ["\nRequire stack:", attempts].flat().join("\n- ");
  throw new Error(message + details);
}

/**
 * Check whether {@link NodeJS.Process.cwd} is parent of the given filename.
 * @param filename - path to a file or directory to check.
 */
export function isUnderWorkingDirectory(filename: string): boolean {
  const r = path.relative(process.cwd(), path.resolve(filename));
  return r && !r.startsWith("..");
}
