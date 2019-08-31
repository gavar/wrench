import { Module } from "module";
import { join } from "path";
import { semanticHotfix } from "./semantic";
import { signale } from "./signale";

export function hotfix(cwd?: string) {
  signale.hotfix(require);
  semanticHotfix(require);

  if (cwd) {
    const root = join(cwd, "package.json");
    const importer = Module.createRequire(root);
    signale.hotfix(importer);
    semanticHotfix(importer);
  }
}
