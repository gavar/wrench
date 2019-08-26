import { dirname, isAbsolute, relative, resolve } from "path";

export function createIsExternal(roots: string[], external: string[]): IsExternal {
  const externals = external && new Set(external.map(x => x.toLowerCase()));
  if (roots) roots = roots.map(x => resolve(x));
  return function (specifier: string, importer: string, id?: string) {
    return isExternal(specifier, importer, id, externals, roots);
  };
}

export function isExternal(specifier: string, importer?: string, id?: string, external?: Set<string>, roots?: string[]): boolean | undefined {
  // TODO: caching
  id = id || resolvePath(specifier, importer);

  // everything inside root dirs is not external
  if (roots && roots.length)
    if (isAbsolute(id) && isPathOfDirs(id, roots))
      return false;

  // check externals
  let path: string;
  if (external && external.size) {
    // try find module when absolute
    path = specifier;
    if (specifier && !specifier.startsWith("."))
      while (path)
        if (external.has(path)) return true;
        else path = dirname(path);

    // check path upwards
    path = id.toLowerCase();
    const cwd = process.cwd().toLowerCase();
    while (path)
      if (external.has(path)) return true;
      else if (path === cwd) break;
      else path = dirname(path);
  }

  // can't say definitely whether external or not
}

function isPathOfDirs(id: string, roots: string[]) {
  for (const root of roots)
    if (dirOwnsFile(root, id))
      return true;
}

export interface IsExternal {
  (specifier: string, importer?: string, id?: string): boolean | undefined;
}

function dirOwnsFile(dir: string, fileName: string) {
  const rel = relative(dir, fileName);
  return !rel.startsWith("..");
}

function resolvePath(specifier: string, importer: string) {
  return importer && specifier.startsWith(".")
    ? resolve(dirname(importer), specifier)
    : specifier;
}
