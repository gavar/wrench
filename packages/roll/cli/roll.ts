process.argv = [
  ...process.argv.slice(0, 2),
  "-c", require.resolve("../preset/nodejs.js"),
  ...process.argv.slice(2),
];

// find rollup executable
const path = require("path");
const packPath = require.resolve("rollup/package.json");
const pack = require(packPath);
const binPath = path.join(packPath, "..", pack.bin.rollup);

// execute rollup
require(binPath);
export {};
