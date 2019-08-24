import { Module } from "module";
import { join } from "path";
import { allowPublishReleaseArray } from "./semantic";
import { signale } from "./signale";

export function hotfix(cwd?: string) {
  let importer = require;
  if (cwd) {
    const root = join(cwd, "package.json");
    importer = Module.createRequire(root);
  }

  signale.hotfix(importer);
  allowPublishReleaseArray(importer);
}
