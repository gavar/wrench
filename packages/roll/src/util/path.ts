import path from "path";

/**
 * Gets the directory name of a path.
 * Returns empty string when provided value is empty.
 * @param p - path to evaluate
 * @see path.dirname
 */
export function dirname(p: string | null): string {
  return p && path.dirname(p) || "";
}

/**
 * Gets the file extension starting with a first dot after last directory separator.
 * As oppose to {@link path.extname}, supports multiple dots as file extension.
 * @example
 * `dir/file.js` -> `.js`
 * `dir/file.js.map` -> `.js.map`
 * @param p - path to evaluate
 */
export function extname(p: string) {
  const fwd = p.lastIndexOf("/") + 1;
  const bck = p.lastIndexOf("\\") + 1;
  const dot = p.indexOf(".", fwd > bck ? fwd : bck);
  return dot < 0 ? "" : dot > 0 ? p.slice(dot) : p;
}

/**
 * Check if path belongs to a directory, but not directory itself.
 * @param sub - path to a file or directory to check.
 * @param dir - directory to check belonging to.
 */
export function isSubPathOf(sub: string, dir: string): boolean {
  if (sub) {
    const rel = path.relative(dir, path.resolve(sub));
    return rel && !rel.startsWith("..");
  }
}

/**
 * Check if path belongs to a current working directory.
 * @param sub - path to a file or directory to check.
 */
export function isSubPathOfWorkingDirectory(sub: string) {
  return isSubPathOf(sub, process.cwd());
}

/**
 * Replace path back-slashes with forward-slashes.
 * @param p - path to process.
 */
export function slash(p: string): string {
  return p ? p.split("\\").join("/") : p;
}
