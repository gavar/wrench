import { yarnConfigCurrent, YarnConfigCurrent } from "@wrench/ywl";
import { cyan, grey, magenta, red } from "colors";
import fs, { pathExistsSync, readdir } from "fs-extra";
import { identity } from "lodash";
import match from "micromatch";
import { join, relative, resolve } from "path";
import { CommandModule } from "yargs";
import { YwlProps } from "../types";

/**
 * List of parameters available to be configured by CLI.
 */
export interface UnlinkProps extends YwlProps {
  /** Whether to run in a testing mode without persisting changes. */
  dryRun: boolean;

  /**
   * Glob patterns filtering links to remove.
   * Powered by {@link https://www.npmjs.com/package/micromatch micromatch}
   */
  pattern: string[];
}

export const unlink: CommandModule<YwlProps, UnlinkProps> = {
  command: "unlink [pattern...]",
  describe: "remove links to external workspaces",

  builder(yargs) {
    return yargs
      .positional("pattern", {type: "string", array: true, default: []})
      .option("dryRun", {type: "boolean"})
      ;
  },

  async handler(props: UnlinkProps): Promise<void> {
    const {pattern} = props;
    const [conf, dirs] = await Promise.all([
      await yarnConfigCurrent(),
      await resolveNamesByPath(props.out),
    ]);

    const cwd = process.cwd();
    const names = pattern && pattern.length ? match(dirs, pattern) : dirs;
    const entries = await Promise.all(names.map(name => linksByName(name, props, conf)));
    const links = entries.flat().filter(identity).sort((a, b) => a.name.localeCompare(b.name));
    await Promise.all(links.map(link => remove(cwd, link, props.dryRun)));
  },
};

const AR = grey("->");
const AL = grey("<-");

async function linksByName(name: string, {root, out}: UnlinkProps, {linkFolder}: YarnConfigCurrent): Promise<LinkEntry[]> {
  const cwd = process.cwd();
  return Promise.all([
    toLinkEntry(resolve(root, out), name, linkFolder),
    toLinkEntry(resolve(root, "node_modules"), name, linkFolder),
    cwd !== root && toLinkEntry(resolve(cwd, "node_modules"), name, linkFolder),
  ]);
}

async function toLinkEntry(dir: string, name: string, linkFolder: string): Promise<LinkEntry> {
  if (dir) {
    const path = resolve(dir, name);
    if (await fs.pathExists(path)) {
      const [realPath, linkPath] = await Promise.all([
        fs.realpath(path),
        exists(resolve(linkFolder, name)),
      ]);

      if (path !== realPath)
        return {name, path, realPath, linkPath} as LinkEntry;
    }
  }
}

async function remove(cwd: string, {name, path, realPath, linkPath}: LinkEntry, dryRun: boolean): Promise<void> {
  const message = [
    red("-"), cyan(name),
    AR, magenta(relative(cwd, path)),
    AL, grey(relative(cwd, realPath)),
  ];

  if (linkPath)
    message.push(AL, grey(linkPath));

  console.log(...message);
  if (!dryRun)
    await fs.unlink(path);
}

async function resolveNamesByPath(path: string): Promise<string[]> {
  if (pathExistsSync(path)) {
    const roots = await readdir(path);
    const promises = roots.map(async name =>
      name.startsWith("@")
        ? await resolveScopeNamesByPath(path, name)
        : name);

    return (await Promise.all(promises)).flat();
  }
  return [];
}

async function resolveScopeNamesByPath(path: string, scope: string): Promise<string[]> {
  const names = await readdir(join(path, scope));
  return names.map(dir => join(scope, dir));
}

async function exists(path: string, value: string = path) {
  if (await fs.pathExists(path))
    return value;
}

interface LinkEntry {
  name: string;
  path: string;
  realPath: string;
  linkPath: string;
}
