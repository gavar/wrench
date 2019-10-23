// @ts-check
require("./boot");
/** @type {WsConfiguration} */
const config = {
  ...require("./packages/semantic-release-ws-preset-nodejs/default"),
  reduceReleaseType: "patch",
};
config.workspace = {
  ...config.workspace,
};
config.packages = {
  ...config.packages,
};
module.exports = config;
