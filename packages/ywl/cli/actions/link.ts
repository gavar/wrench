import {
  createDependencyGraph,
  DependencyNode,
  flattenDependencyGraph,
  YarnConfigCurrent,
  yarnConfigCurrent,
  yarnWorkspacesInfo,
} from "@wrench/ywl";
import { cyan, green, grey, red } from "colors";
import { ensureDir, existsSync, realpath, remove, symlink, unlink } from "fs-extra";
import { intersection } from "lodash";
import match from "micromatch";
import { dirname, relative, resolve } from "path";
import { CommandModule } from "yargs";
import { YwlProps } from "../types";

/**
 * List of parameters available to be configured by CLI.
 */
export interface LinkProps extends YwlProps {

  /** Whether to run in a testing mode without persisting changes. */
  dryRun: boolean;

  /** Restrict the depth of the dependencies to search for. */
  depth?: number;

  /** Flag to remove previous symlinks. */
  clean: boolean;

  /**
   * Glob patterns filtering dependencies ellidable to be included as workspace.
   * Powered by {@link https://www.npmjs.com/package/micromatch micromatch}
   */
  pattern: string[];

  /** Whether to include dev dependencies. */
  dev: boolean;

  /** Whether to allow to include links not listed in dependencies. */
  unlisted: boolean;
}

export const link: CommandModule<YwlProps, LinkProps> = {
  aliases: "*",
  command: "link [pattern...]",
  describe: "add local dependencies as workspaces",

  builder(yargs) {
    return yargs
      .positional("pattern", {type: "string", array: true, default: []})
      .option("dev", {type: "boolean", default: true})
      .option("unlisted", {type: "boolean", default: false})
      .option("clean", {type: "boolean", default: false})
      .option("depth", {type: "number", default: 5})
      .option("dryRun", {type: "boolean"})
      ;
  },

  async handler(props): Promise<void> {
    const {root, pattern} = props;
    const run = !props.dryRun;

    const [conf, own] = await Promise.all([
      await yarnConfigCurrent(),
      await resolveOwnPackages(props),
    ]);

    const dirs = Object.values(own);
    let links: string[];
    if (props.unlisted) {
      links = conf.linkedModules;
    } else {
      const graph = createDependencyGraph(dirs, props);
      const flat = flattenDependencyGraph(graph, props);
      links = toUniqExternalNames(flat, own);
    }

    if (pattern && pattern.length) links = match(links, pattern);
    links = intersection(links, conf.linkedModules).sort();

    // clear previous links
    if (props.clean)
      run && await remove(resolve(root, props.out));

    run && await ensureDir(resolve(root, props.out));
    await Promise.all(links.map(x => updateSymlink(x, conf, props)));
  },
};

const AR = grey("->");
const AL = grey("<-");

async function updateSymlink(name: string, conf: YarnConfigCurrent, props: LinkProps): Promise<void> {
  const cwd = process.cwd();
  const run = !props.dryRun;
  const target = resolve(conf.linkFolder, name);
  const path = resolve(props.root, props.out, name);

  const [a, b] = await Promise.all([
    existsSync(path) ? realpath(path) : "",
    realpath(target),
  ]);

  if (a === b) {
    console.log(grey("~"), cyan(name),
      AR, grey(relative(cwd, path)),
      AR, grey(a),
      AL, grey(target));
    return;
  }

  if (a) {
    console.log(red("-"), cyan(name),
      AR, grey(relative(cwd, a)),
      AL, grey(target));
    run && await unlink(path);
  } else {
    run && await ensureDir(dirname(path));
  }

  console.log(green("+"), cyan(name),
    AR, grey(relative(cwd, path)),
    AR, grey(relative(cwd, b)),
    AL, grey(target));

  run && await symlink(target, path);
}

async function resolveOwnPackages(props: LinkProps): Promise<Record<string, string>> {
  const root = resolve(props.root);
  const out = resolve(root, props.out);

  const own: Record<string, string> = {
    [props.pack.name]: root,
  };

  const info = await yarnWorkspacesInfo();
  for (const [name, w] of Object.entries(info)) {
    const path = resolve(root, w.location);
    if (!dirOwnsPath(out, path))
      own[name] = path;
  }

  return own;
}

function dirOwnsPath(dir: string, path: string) {
  const rel = relative(dir, path);
  return !rel.startsWith("..");
}

function toUniqExternalNames(graph: DependencyNode[], own: Record<string, string>): string[] {
  const uniq: Record<string, boolean> = {};
  for (const node of graph)
    if (!own[node.name])
      uniq[node.name] = true;
  return Object.keys(uniq);
}
