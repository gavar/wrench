// @ts-check

/**
 * Register JSON5 loader for the particular extension.
 * @param {string} [ext] - file extension.
 */
function register(ext) {
  // @ts-ignore
  // noinspection NpmUsedModulesInstalled
  require("json5/lib/register");
  if (typeof ext === "string")
    require.extensions[ext] = require.extensions[".json5"];
}

module.exports = {
  register,
};
