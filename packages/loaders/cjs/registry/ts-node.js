// @ts-check
/** @typedef {import("../../types/ts-node").Options} Options */

/** @type {import("../../types").LoaderWithProps<Options>} */
const TS_NODE_LOADER = ["ts-node", {
  func: "register",
  args: {
    compilerOptions: {
      module: "commonjs",
      noEmitHelpers: false,
    },
  },
}];

module.exports = {
  TS_NODE_LOADER,
};
