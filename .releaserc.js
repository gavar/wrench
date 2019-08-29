// @ts-check
require("@wrench/loaders/register");
require("./boot");
const {npm} = require("./packages/semantic-release-ws-preset-nodejs");
module.exports = npm({
  base: {
    workspace: {
      //
    },
  },
});
