import { copycatPackages } from "..";
import { parse } from "./parse";
import glob from "glob";

const props = parse();
const fileNames = resolveFileNames(props.recurse);
copycatPackages(fileNames);

function resolveFileNames(recurse: boolean): string[] {
  return !recurse
    ? ["package.json"]
    : glob.sync("**/package.json", {
      dot: false,
      nodir: true,
      ignore: ["**/node_modules/**"],
    });
}

// mark as non global for typescript
export {};
