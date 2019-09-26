// @ts-check
const {TS_NODE_LOADER} = require("./ts-node");
const {json5Loader} = require("./json5");

/** @type {import('../../types').LoaderRegistry} */
const loaders = {
  "*": ["source-map-support/register"],
  ".ts": TS_NODE_LOADER,
  ".tsx": TS_NODE_LOADER,
  ".json5": json5Loader(),
  ".tsconfig.json": json5Loader(".tsconfig.json"),
};

module.exports = {
  loaders,
  TS_NODE_LOADER,
};
