import fs from "fs";
import path from "path";
import { extname } from "./path";

/**
 * Search for a file in a directory having provided name and any of the given extensions.
 * @param directory - path to a directory where to search for a file.
 * @param name - name of the file to search for.
 * @param extensions - extensions to try when searching for a file.
 * @throws Error when unable to find a file.
 */
export function resolve(directory: string, name: string, extensions: string[] = resolve.extensions): string {
  const context: Resolution = {locations: []};

  // original extension
  if (tryExtensions(context, directory, name, extensions))
    return context.fileName;

  // rewrite extension
  const ext = extname(name);
  if (ext && tryExtensions(context, directory, name.slice(0, -ext.length), extensions))
    return context.fileName;

  const message = `unable to resolve module '${name}' from '${directory}'`;
  throw new Error([message, "Require stack:", context.locations.join("\n- ")].join("\n"));
}

export namespace resolve {
  /** File extensions to use by default for resolution. */
  export const extensions: string[] = [".ts", ".js"];
}

function tryExtensions(r: Resolution, directory: string, name: string, extensions: string[]): boolean {
  for (const ext of extensions)
    if (tryFileName(r, path.join(directory, name + ext)))
      return true;
}

function tryFileName(r: Resolution, fileName: string): boolean {
  r.locations.push(fileName);
  if (fs.existsSync(fileName)) {
    r.fileName = fileName;
    return true;
  }
}

interface Resolution {
  fileName?: string;
  locations: string[];
}
