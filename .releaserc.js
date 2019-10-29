// @ts-check
require("./boot");
/** @type {WsConfiguration} */
const config = {
  ...require("./packages/semantic-release-ws-preset-nodejs/default"),
};

config.workspace = {
  ...config.workspace,
  reduceReleaseType: "patch",
};

config.packages = {
  ...config.packages,
};

module.exports = config;
