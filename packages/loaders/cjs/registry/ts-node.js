// @ts-check
/** @typedef {import("../../types/ts-node").Options} Options */

/** @type {import("../../types").LoaderWithProps<Options>} */
const TS_NODE_LOADER = ["ts-node", {
  func: "register",
  args: args(),
}];

/**
 * @returns {Options}
 */
function args() {
  /** @type {Options} */
  const options = {
    // no reason to ignore as it should only resolve to ts files
    ignore: [],
    compilerOptions: {
      declaration: false,
      declarationMap: false,
      module: "commonjs",
      noEmitHelpers: false,
    },
  };

  if (process.env.TS_NODE_IGNORE) delete options.ignore;
  if (process.env.TS_NODE_SKIP_IGNORE) delete options.ignore;
  if (process.env.TS_NODE_COMPILER_OPTIONS) delete options.compilerOptions;
  return options;
}

module.exports = {
  TS_NODE_LOADER,
};
