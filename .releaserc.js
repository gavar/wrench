// @ts-check
require("./boot");
/** @type {WsConfiguration} */
const config = {
  ...require("./packages/semantic-release-ws-preset-nodejs/default"),
};
config.workspace = {
  ...config.workspace,
};
config.packages = {
  ...config.packages,
};
module.exports = config;
