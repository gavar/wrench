// @ts-check
const {TS_NODE_LOADER} = require("./ts-node");

/** @type {import('../../types').LoaderRegistry} */
const loaders = {
  "*": ["source-map-support/register"],
  ".ts": TS_NODE_LOADER,
  ".tsx": TS_NODE_LOADER,
};

module.exports = {
  loaders,
  TS_NODE_LOADER,
};
