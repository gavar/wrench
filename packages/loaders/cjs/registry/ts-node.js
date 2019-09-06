// @ts-check
/** @typedef {import("../../types/ts-node").Options} Options */

/** @type {import("../../types").LoaderWithProps<Options>} */
const TS_NODE_LOADER = ["ts-node", {
  func: "register",
  args,
}];

/**
 * @param {Options} options
 * @returns {Options}
 */
function args(options) {
  /** @type {Options} */
  const defaults = {};

  if (!process.env.TS_NODE_IGNORE)
    defaults.ignore = [
      // @ts-ignore
      // ignore only js / jsx files inside node_modules, since it may contain symlinks with .ts files
      /\/node_modules\/(.*?)\.jsx?/,
    ];

  if (!process.env.TS_NODE_COMPILER_OPTIONS)
    defaults.compilerOptions = {
      module: "commonjs",
      noEmitHelpers: false,
    };

  return Object.assign(defaults, options);
}

module.exports = {
  TS_NODE_LOADER,
};
