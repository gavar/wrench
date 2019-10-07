const {nodejs, parseCommand} = require("..");

module.exports = function (command) {
  const config = parseCommand(command);
  const {output, ...input} = config;
  return nodejs(void 0, input, output[0] || output);
};
