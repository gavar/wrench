import {
  createDependencyGraph,
  flattenDependencyGraph,
  YarnConfigCurrent,
  yarnConfigCurrent,
  yarnWorkspacesInfo,
} from "@wrench/ywl";
import { cyan, green, grey, magenta, red } from "colors";
import { ensureDir, existsSync, realpath, symlink, unlink } from "fs-extra";
import { intersection, reject, uniq } from "lodash";
import match from "micromatch";
import { dirname, relative, resolve } from "path";
import { CommandModule } from "yargs";
import { YwlProps } from "../types";
import { coercePattern } from "./common";

const AR = grey("->");

/** Parameters available to be configured by CLI. */
export interface LinkProps extends YwlProps {

  /** Whether to run in a testing mode without persisting changes. */
  dry: boolean;

  /** Restrict the depth of the dependencies to search for. */
  depth?: number;

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
      .positional("pattern", {type: "string", array: true, default: [], coerce: coercePattern})
      .option("dev", {type: "boolean", default: true})
      .option("unlisted", {type: "boolean", default: false})
      .option("depth", {type: "number", default: 5})
      .option("dry", {alias: "dry-run", type: "boolean"})
      ;
  },

  async handler(props: LinkProps): Promise<void> {
    const {root, pattern} = props;
    const [conf, workspaces] = await Promise.all([
      await yarnConfigCurrent(),
      await resolveWorkspaces(root),
    ]);
    console.log(grey(`yarn links folder: ${conf.linkFolder}`));

    // collect dependency names
    let names: string[];
    if (props.unlisted) {
      names = conf.linkedModules;
    } else {
      const paths = Object.values(workspaces);
      const graph = createDependencyGraph(paths, props);
      const flat = flattenDependencyGraph(graph, props);
      names = uniq(flat.map(x => x.name));
    }

    // - exclude own packages
    // - filter by matching pattern if any
    // - pick only names registered via `yarn link`
    names = reject(names, workspaces.hasOwnProperty.bind(workspaces));
    if (pattern && pattern.length) names = match(names, pattern);
    names = intersection(names, conf.linkedModules).sort();
    if (names.length < 1)
      return console.log(magenta("no links found for addition"));

    const updates = names.map(name => updateSymlink(name, conf, props));
    await Promise.all(updates);
  },
};

async function updateSymlink(name: string, conf: YarnConfigCurrent, props: LinkProps): Promise<void> {
  const cwd = process.cwd();
  const run = !props.dry;
  const target = resolve(conf.linkFolder, name);
  const [out] = conf.registryFolders;
  const path = resolve(props.root, out, name);

  const [a, b] = await Promise.all([
    existsSync(path) ? realpath(path) : "",
    realpath(target),
  ]);

  if (a === b) {
    console.log(grey("~"), cyan(name),
      AR, grey(relative(cwd, path)),
      AR, grey(a),
    );
    return;
  }

  if (a) {
    console.log(red("-"), cyan(name),
      AR, grey(relative(cwd, a)),
    );
    run && await unlink(path);
  } else {
    run && await ensureDir(dirname(path));
  }

  console.log(green("+"), cyan(name),
    AR, grey(relative(cwd, path)),
    AR, grey(relative(cwd, b)),
  );

  run && await symlink(target, path);
}

/**
 * Resolve workspace packages of the.
 * @param root - project root path.
 * @returns object having package name as a key and absolute path as a value.
 */
async function resolveWorkspaces(root: string): Promise<Record<string, string>> {
  root = resolve(root);
  const packages: Record<string, string> = {};
  const info = await yarnWorkspacesInfo();
  for (const [name, w] of Object.entries(info))
    packages[name] = resolve(root, w.location);
  return packages;
}

/**
 * Check if directory is a parent to a given children path.
 * @param root - root directory to check.
 * @param path - path that should be children.
 */
function isParentOf(root: string, path: string): boolean {
  return !relative(root, path).startsWith("..");
}
