import { exec, ExecOptions } from "child_process";
import { pick } from "lodash";
import { promisify } from "util";

export const execAsync = promisify(exec);

const execOptionsKeys: Array<keyof ExecOptions> = [
  "cwd",
  "env",
];

export function asExecOptions<T extends ExecOptions>(options: T): Pick<T, keyof ExecOptions> {
  if (options)
    return pick(options, execOptionsKeys);
}
