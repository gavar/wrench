// @ts-check
/** @typedef {import("../types").Loader} Loader */
/** @typedef {import("../types").LoaderProps} LoaderProps */
/** @typedef {import("../types").LoaderOption} LoaderOption */
/** @typedef {import("../types").LoaderWithProps} LoaderWithProps */
/** @typedef {import("../types").LoaderRegistry} LoaderRegistry */

/**
 * @callback RequireHook
 * @param {NodeModule} m
 * @param {string} filename
 */

/**
 * @typedef RequireHookProps
 * @prop {boolean} [done] - whether hook has been invoked.
 * @prop {object} [owner] - module produced the hook.
 */

const {cyan, grey, yellow} = require("colors");
const {Module} = require("module");
const {join} = require("path");

const LR = grey("<<");
const PREFIX = grey("[@wrench/loader]:");

/**
 * @param {LoaderRegistry} registry
 * @param {string} cwd
 */
function register(registry, cwd = process.cwd()) {
  const importer = Module.createRequire(join(cwd, "package.json"));
  for (const ext of Object.keys(registry))
    if (!warnHookPresent(ext, Module._extensions[ext])) {
      const loaders = arrifyLoaderOption(registry[ext]);
      if (ext === "*") loaders.forEach(loader => load(importer, loader, ext));
      else Module._extensions[ext] = createTransform(importer, ext, loaders);
    }
}

/**
 *
 * @param {NodeRequire} importer
 * @param {string} ext
 * @param {LoaderOption[]} loaders
 * @returns {RequireHook & RequireHookProps}
 */
function createTransform(importer, ext, loaders) {
  /**
   * @type {RequireHook & RequireHookProps}
   * @param {NodeModule} m
   * @param {string} filename
   */
  const hook = function (m, filename) {
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
    else console.warn(PREFIX, yellow(`no require hook installed for ${ext}`));
  };
  hook.owner = module;
  return hook;
}

/**
 * @param {NodeRequire} importer
 * @param {LoaderOption} loader
 * @param {string} ext
 */
function load(importer, loader, ext) {
  const [id, prop, args] = normalizeLoaderOption(loader);
  const path = tryResolve(importer, id);
  if (path) {
    // check already visited
    if (!visit(path, prop, args))
      return console.debug(PREFIX, `skip loader '${id}' for '${ext}' - already installed with same configuration`);

    // import loader
    console.log(PREFIX, cyan(id), LR, grey(path));
    const m = require(path);

    // check loader function
    if (prop) {
      const f = m[prop];
      if (typeof f !== "function")
        return console.warn(PREFIX, yellow(`unable to install ${id} = '${prop}' is not a function`));

      // invoke without args
      if (args == null)
        return f();

      // invoke with args
      return Array.isArray(args)
        ? f(...args)
        : f(args);
    }
  }
}

/** @typedef {[string, string]} Visit */
/** @type {Object.<string, Visit>} */
const visits = {};

/**
 *
 * @param {string} path
 * @param {string} property
 * @param {string} args
 */
function visit(path, property, args) {
  const prev = visits[path];
  /** @type {Visit} */
  const next = [property, JSON.stringify(args)];
  if (isArrayDiff(prev, next)) {
    visits[path] = next;
    return true;
  }
}

/**
 * @param {any[]} a
 * @param {any[]} b
 * @return {boolean}
 */
function isArrayDiff(a, b) {
  if (a === b) return false;
  if (a == null) return b != null;
  if (b == null) return true;
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++)
    if (a[i] !== b[i])
      return true;
}

/**
 * @param {string} ext
 * @param {RequireHook & RequireHookProps} hook
 * @returns {boolean}
 */
function warnHookPresent(ext, hook) {
  if (hook && hook.owner !== module) {
    console.warn(PREFIX, `skip registering hook for '${ext}' - already registered externally`);
    return true;
  }
}

/**
 * @param {LoaderOption | LoaderOption[]} option
 * @returns {LoaderOption[]}
 */
function arrifyLoaderOption(option) {
  // { ".ts": "ts-loader" }
  if (isString(option))
    return [option];

  // { ".ts": ["ts-loader", {...}] }
  if (isLoaderWithProps(option))
    return [option];

  if (Array.isArray(option)) {
    // { ".ts": ["ts-node/register", "babel/register", ...] }
    if (option.every(isString))
      return option;

    // { ".ts": ["ts-node/register", ["babel/register", {...}], ...] }
    return option;
  }

  throw new Error("unknown option type: " + option);
}

/** @type LoaderProps */
const NullProps = {
  func: null,
  args: null,
};

/**
 * @param {LoaderOption} option
 * @returns {[string, string?, object?]}
 */
function normalizeLoaderOption(option) {
  if (isLoaderWithProps(option)) {
    const [id, props] = option;
    const {func, args} = props || NullProps;
    return [id, func, args];
  }
  return [option, null, null];
}

/**
 * @param {any | string} v
 * @returns {v is string}
 */
function isString(v) {
  return typeof v === "string";
}

/**
 * @param {any | LoaderOption} v
 * @returns {v is LoaderWithProps}
 */
function isLoaderWithProps(v) {
  if (Array.isArray(v) && v.length <= 2) {
    const [id, props] = v;
    return isString(id)
      && props == null || isObject(props);
  }
}

/**
 * @param {any} v
 * @returns {v is object}
 */
function isObject(v) {
  return typeof v === "object";
}

/**
 * @param {NodeRequire} importer
 * @param {string} id
 * @returns {string}
 */
function tryResolve(importer, id) {
  try {
    return importer.resolve(id);
  } catch (e) {
    return "";
  }
}

module.exports = {
  register,
};
