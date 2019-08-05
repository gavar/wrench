const {nodejs, parseCLI} = require("..");

module.exports = function (cli) {
  return nodejs(void 0, parseCLI(cli));
};
