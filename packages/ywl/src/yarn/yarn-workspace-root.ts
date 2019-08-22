import findUp from "find-up";
import fs from "fs";
import { dirname } from "path";
import { promisify } from "util";
import { Package } from "../types";

const PACKAGE_JSON = "package.json";
const readFile = promisify(fs.readFile);

export async function yarnWorkspaceRoot(cwd: string): Promise<[string?, Package?]> {
  const options: findUp.Options = {cwd};
  let filename = await findUp(PACKAGE_JSON, options);
  while (filename) {
    const buff = await readFile(filename);
    const pack: Package = JSON.parse(buff.toString());
    if (pack.workspaces && pack.workspaces.packages)
      return [dirname(filename), pack];

    options.cwd = dirname(dirname(filename));
    filename = await findUp(PACKAGE_JSON, options);
  }

  return [];
}
