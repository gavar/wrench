// @ts-check

/**
 * Create JSON5 loader for particular file type.
 * @param {string} [ext=".json5"] - file extension.
 * @return {import("../../types").LoaderWithProps}
 */
function json5Loader(ext) {
  return ["@wrench/loaders/register/json5", {
    func: "register",
    args: [ext],
  }];
}

module.exports = {
  json5Loader,
};
