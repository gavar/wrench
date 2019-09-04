// @ts-check
/// <reference path="../../../@types/node/index.d.ts" />
/** @typedef {typeof NodeJS.Module} ModuleType */
/** @typedef {import("resolve").SyncOpts} SyncOpts */

/**
 * @typedef {NodeModule} NodeModuleInternal
 * @prop {string} [path]
 */

/**
* @typedef {SyncOpts} SyncOptions
* @prop {string} filename
*/

const { sync } = require("resolve");
const { Module } = require("module");
const { _resolveFilename } = Module;

/** @type {string[]} */
let $paths;

/** @type {NodeModuleInternal} */
let $parent;

/** @type {SyncOptions} */
const options = {
  // @ts-ignore
  paths: () => $paths,
  preserveSymlinks: true,
};

/**
 * 
 * @param {string} request 
 * @param {string[]} paths 
 * @param {boolean} main
 * @returns {string}
 */
function findPath(request, paths, main) {
  $paths = paths;
  options.filename = $parent.id;
  options.basedir = $parent.path;
  options.extensions = Object.keys(Module._extensions);
  return sync(request, options);
}

/**
 * 
 * @param {string} request 
 * @param {NodeModule} parent 
 * @param {boolean} main 
 * @returns {string}
 */
function resolveFileName(request, parent, main) {
  return _resolveFilename(request, $parent = parent, main);
}

Module._findPath = findPath;
Module._resolveFilename = resolveFileName;