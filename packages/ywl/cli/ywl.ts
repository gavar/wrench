import yargs, { Argv } from "yargs";
import { yarnWorkspaceRoot } from "@wrench/ywl";
import { link } from "./actions";
import { YwlProps } from "./types";

void async function () {
  const [root, pack] = await yarnWorkspaceRoot(process.cwd());
  if (!root) throw new Error("unable to find workspace root");
  (yargs as Argv<YwlProps>)(process.argv.slice(2), root)
    .option("out", {type: "string", default: ".ywl"})
    .pkgConf("ywl", root)
    .middleware(args => {
      args.root = root;
      args.pack = pack;
    })
    .command(link)
    .argv;
}();

// mark as non global for typescript
export {};
