import { cyan, grey, yellow } from "colors";
import { Module } from "module";
import { join } from "path";
import { Loader, LoaderHook, LoaderRegistry, RequireTransform } from "./loaders";

interface TransformHook extends RequireTransform {
  done: boolean;
  owner: any;
}

const OWNER = module;
const visits = new Set();
const LR = grey("<<");
const PREFIX = grey("[@wrench/loader]:");

export function register(registry: LoaderRegistry, cwd = process.cwd()) {
  const {_extensions} = Module;
  const importer = Module.createRequire(join(cwd, "package.json"));
  for (const ext of Object.keys(registry))
    if (!warnHookPresent(ext, _extensions[ext] as any)) {
      const loaders = arrifyLoader(registry[ext]);
      if (ext === "*") loaders.forEach(loader => load(importer, loader, ext));
      else _extensions[ext] = createTransform(importer, ext, loaders);
    }
}

function createTransform(importer: NodeRequire, ext: string, loaders: Loader[]): TransformHook {
  // create hook function
  const hook = function (m: NodeModule, filename: string) {
    if (hook.done) return;
    hook.done = true;

    // delete self to avoid being called by loader
    if (Module._extensions[ext] === hook)
      delete Module._extensions[ext];

    // initialize loaders
    for (const loader of loaders)
      load(importer, loader, ext);

    // call loader to transform current file
    const loader = Module._extensions[ext];
    if (loader) loader(m, filename);
    else console.warn(PREFIX, yellow(`no require hook was installed for ${ext}`));
  } as TransformHook;

  hook.owner = OWNER;
  return hook;
}

function load(importer: NodeRequire, loader: Loader, ext: string) {
  const [id, hook] = normalizeLoader(loader);
  const path = tryResolve(importer, id);
  if (path) {
    if (visits.has(loader))
      return console.debug(PREFIX, `skip installing loader '${id}' for '${ext}' as it has bee installed with same configuration`);

    console.log(PREFIX, cyan(id), LR, grey(path));
    const instance = require(path);
    if (hook) hook(instance, ext);
  }
}

function warnHookPresent(ext: string, hook: Partial<TransformHook>): boolean {
  if (hook && hook.owner !== OWNER) {
    console.warn(PREFIX, `skip registering hook for '${ext}' since it already registered externally`);
    return true;
  }
}

function arrifyLoader(entry: Loader | Loader[]): Loader[] {
  if (typeof entry == "string")
    return [entry];

  if (Array.isArray(entry)) {
    if (entry.every(isString)) return entry as string[];
    if (entry.some(Array.isArray)) return entry as Loader[];
    return [entry as Loader];
  }
}

function normalizeLoader(entry: Loader): LoaderHook {
  return Array.isArray(entry) ? entry : [entry];
}

function isString(v: any): v is string {
  return typeof v === "string";
}

function tryResolve(importer: NodeRequire, id: string): string {
  try {
    return importer.resolve(id);
  } catch (e) {
    return "";
  }
}
