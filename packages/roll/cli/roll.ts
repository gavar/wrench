process.argv = [
  ...process.argv.slice(0, 2),
  "-c", require.resolve("@wrench/roll/preset/nodejs.js"),
  ...process.argv.slice(2),
];

const path = require("path");
const {Module} = require("module");

void function () {
  // find rollup executable
  const from = path.resolve("package.json");
  const importer = Module.createRequire(from);
  const packPath = importer.resolve("rollup/package.json");
  const pack = require(packPath);
  const binPath = path.join(packPath, "..", pack.bin.rollup);
  // execute
  require(binPath);
}();

export {};
