import { Branch } from "../types";

const $ = require("semantic-release/lib/branches/get-tags");

export async function getTags(cwd: string,
                              env: NodeJS.ProcessEnv,
                              tagFormat: string,
                              branches: Branch[]): Promise<Branch[]> {
  return $({cwd, env, options: {tagFormat}}, branches);
}
