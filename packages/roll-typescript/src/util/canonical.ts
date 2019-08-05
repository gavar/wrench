import { resolve, sep } from "path";

/** Counterparts for each separator type. */
const inv: Record<typeof sep, typeof sep> = {
  "/": "\\",
  "\\": "/",
};

/**
 * Gets the canonical path of the provided path, by:
 * - converting path to absolute
 * - normalizing separators to a {@link sep platform-specific file separator}
 * - converting to lowercase when {@param caseSensitive} is false.
 * @param path - path to process.
 * @param caseSensitive - whether file system is case sensitive.
 */
export function canonical(path: string, caseSensitive?: boolean): string {
  path = resolve(path);
  if (!caseSensitive) path = path.toLowerCase();
  path = path.split(inv[sep]).join(sep);
  return path;
}
