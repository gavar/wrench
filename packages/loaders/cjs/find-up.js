const {existsSync} = require("fs");
const {join, dirname} = require("path");

/**
 * Find filename upwards in a directory structure starting from the current working directory.
 * @param {string} fileName - name of the file to search for.
 * @returns {string} path to a file if found.
 */
module.exports = function findUp(fileName) {
  let prev = "";
  let curr = process.cwd();
  while (curr !== prev) {
    prev = curr;
    const p = join(curr, fileName);
    if (existsSync(p)) return p;
    curr = dirname(curr);
  }
};
