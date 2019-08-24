const path = require("path");
const fs = require("fs");
const {Module} = require("module");
const {loaders} = require("@wrench/loaders");

/**
 * Resolution results.
 * @typedef {object} Resolution
 * @property {string[]} locations
 * @property {string} [filename]
 */

/**
 * Find and run executable.
 * @param {string} filename.
 */
function exec(filename) {
  // try to use colors if available
  const importer = Module.createRequire(filename);
  let {grey} = tryRequire("colors", importer);
  grey = grey || identity;

  const entry = resolve(filename);
  if (entry.filename) {
    console.log(grey("[@wrench/executable]:"), grey(entry.filename));
    require("@wrench/loaders/register");
    require(entry.filename);
  } else {
    console.error("unable to find bin file to execute", entry.locations);
    process.exit(1);
  }
}

/**
 * Try to import module with id.
 * @param {string} id - module id.
 * @param {NodeRequire} importer - module importer.
 * @returns {any | ""} - module contents.
 */
function tryRequire(id, importer = require) {
  try { return importer(id); } //
  catch (e) { return ""; }
}

/**
 * Try to resolve path to a module with id.
 * @param {string} id - module id.
 * @param {NodeRequire} importer - module importer.
 * @returns {string} - module path.
 */
function tryResolve(id, importer = require) {
  try { return importer.resolve(id); } //
  catch (e) { }
}

/**
 * Collect paths to check for bin entry.
 * @param {string} filename - executable filename.
 * @param {Resolution} [context] - resolution context.
 * @return {Resolution} - resolution context
 */
function resolve(filename, context) {
  context = context || {locations: []};
  const native = Object.keys(Module._extensions);
  const foreign = Object.keys(loaders).filter(isForeignExtension);
  const {dir, name} = path.parse(filename);

  // try default extensions in a lib folder
  const lib = path.resolve(dir, "lib", name, name);
  if (find(lib, native, context))
    return context;

  // try all extensions in a cli folder
  const cli = path.resolve(dir, "../cli", name);
  if (find(cli, native.concat(foreign), context))
    return context;

  return context;
}

/**
 * Whether provided extension is not natively supported by NodeJS.
 * @param {string} ext - file extension to check.
 * @return {boolean}
 */
function isForeignExtension(ext) {
  return ext !== "*" && !Module._extensions[ext];
}

/**
 * Search for a file in a directory having provided name and any of the given extensions.
 * @param {string} filename - name of the file to search for.
 * @param {string[]} extensions - extensions to try when searching for a file.
 * @param {Resolution} context - resolution context.
 */
function find(filename, extensions, context) {
  // original extension
  if (checkExtensions(filename, extensions, context))
    return true;

  // rewrite extension
  let ext = path.extname(filename);
  for (; ext; ext = path.extname(filename)) {
    filename = filename.slice(0, -ext.length);
    if (checkExtensions(filename, extensions, context))
      return true;
  }
}

/**
 * Check file exists with any of the given extension.
 * @param {string} filename
 * @param {string[]} extensions
 * @param {Resolution} context
 * @return {boolean} - true when any file found; false otherwise.
 */
function checkExtensions(filename, extensions, context) {
  for (const ext of extensions)
    if (checkFile(filename + ext, context))
      return true;
}

/**
 * Check file exists and track resolution.
 * @param {string} filename - filename to check.
 * @param {Resolution} context - resolution context.
 * @return {boolean} - true when file exists; false otherwise.
 */
function checkFile(filename, context) {
  filename = slash(filename);
  context.locations.push(filename);
  if (fs.existsSync(filename)) {
    context.filename = filename;
    return true;
  }
}

/**
 * Normalize to forward slashes.
 * @param {string} value
 * @return {string}
 */
function slash(value) {
  return value.split("\\").join("/");
}

function identity(x) {
  return x;
}

module.exports = {
  exec,
  resolve,
  tryRequire,
  tryResolve,
  isForeignExtension,
};
