process.argv = [
  ...process.argv.slice(0, 2),
  "-c", require.resolve("../preset/nodejs.js"),
  ...process.argv.slice(2),
];

const path = require("path");
const {Module} = require("module");

void function () {
  // find rollup executable
  const importer = Module.createRequire(process.cwd());
  const packPath = importer.resolve("rollup/package.json");
  const pack = require(packPath);
  const binPath = path.join(packPath, "..", pack.bin.rollup);
  // execute
  require(binPath);
}();

export {};
