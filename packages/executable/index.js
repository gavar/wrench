const path = require("path");
const {Module} = require("module");

/**
 * Find and run executable.
 * @param {string} filename.
 */
function exec(filename) {
  const importer = Module.createRequire(filename);
  tryRequire("@wrench/loaders/register", importer);
  const {grey} = tryRequire("colors", importer);

  const locations = resolvePaths(filename);
  const location = locations.find(x => tryResolve(x, importer));
  if (location) {
    const msg = ">> " + location;
    console.log(grey ? grey(msg) : msg);
    require(location, importer);
  } else {
    console.error("unable to find bin file to execute", locations);
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
 * @return {string[]} - list of possible locations.
 */
function resolvePaths(filename) {
  const {dir, name, ext} = path.parse(filename);
  const js = path.resolve(dir, "lib", name, name);
  const ts = path.resolve(dir, "../cli", name.slice(-ext.length));
  return [js, ts];
}

module.exports = {
  exec,
  tryRequire,
  tryResolve,
  resolvePaths,
};
