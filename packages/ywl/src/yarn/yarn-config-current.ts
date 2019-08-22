import cp from "child_process";
import { promisify } from "util";

const exec = promisify(cp.exec);

export interface YarnConfigCurrent {
  linkedModules: string[];
  linkFolder: string;
}

export async function yarnConfigCurrent(): Promise<YarnConfigCurrent> {
  const args = ["yarn", "config", "current", "--json"];
  const raw = await exec(args.join(" "));
  const json = JSON.parse(raw.stdout);
  const conf: YarnConfigCurrent = JSON.parse(json.data);
  conf.linkedModules = conf.linkedModules.map(slash);
  return conf;
}

function slash(filename: string) {
  return filename.split("\\").join("/");
}
