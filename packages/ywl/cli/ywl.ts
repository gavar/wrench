import { yarnWorkspaceRoot } from "@wrench/ywl";
import yargs, { Argv } from "yargs";
import { link, unlink } from "./actions";
import { YwlProps } from "./types";

void async function () {
  const [root, pack] = await yarnWorkspaceRoot(process.cwd());
  if (!root) throw new Error("unable to find workspace root");
  (yargs as Argv<YwlProps>)(process.argv.slice(2), root)
    .scriptName("ywl")
    .pkgConf("ywl", root)
    .option("workspaceRegistry", {default: ".ywl"})
    .middleware(args => {
      args.root = root;
      args.pack = pack;
    })
    .command(link)
    .command(unlink)
    .argv;
}();

// mark as non global for typescript
export {};
