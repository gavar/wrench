import { yarnConfigCurrent, YarnConfigCurrent } from "@wrench/ywl";
import { cyan, grey, magenta, red } from "colors";
import { existsSync } from "fs";
import fse from "fs-extra";
import match from "micromatch";
import { join, relative, resolve } from "path";
import { CommandModule } from "yargs";
import { YwlProps } from "../types";
import { coercePattern } from "./common";

const AR = grey("->");

/** Parameters available to be configured by CLI. */
export interface UnlinkProps extends YwlProps {
  /** Whether to run in a testing mode without persisting changes. */
  dry: boolean;

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
      .positional("pattern", {type: "string", array: true, default: [], coerce: coercePattern})
      .option("dry", {alias: "dry-run", type: "boolean"})
      ;
  },

  async handler(props: UnlinkProps): Promise<void> {
    const {pattern} = props;
    const cwd = process.cwd();
    const root = resolve(props.root);
    const conf = await yarnConfigCurrent();
    const registryPath = resolve(root, conf.registryFolders[0]);
    console.log(grey(`yarn links folder: ${conf.linkFolder}`));

    // resolve package names
    let names = await scanPackageNames(registryPath);
    if (pattern && pattern.length) names = match(names, pattern);

    // select packages that are symlinks
    const context: LinkResolutionContext = {cwd, root, registryPath, linksPath: conf.linkFolder};
    const links = (await resolveLinks(names, context)).sort(byNameAsc);
    if (links.length < 1)
      return console.log(magenta("no links found for removal"));

    // remove links
    const removals = links.map(link => remove(root, link, props.dry));
    await Promise.all(removals);
  },
};

interface Link {
  /** Name of the package. */
  name: string;
  /** Path to a package. */
  path: string;
  /** Real path to a package. */
  realPath: string;
  /** Path to global link pointing at real path. */
  linkPath: string;
}

interface LinkResolutionContext {
  /**
   * Current working directory.
   * @see NodeJS.Process.cwd
   */
  cwd: string;

  /** Path to a project root. */
  root: string;

  /**
   * Path to a global directory containing yarn links.
   * @see YarnConfigCurrent.linkFolder
   */
  linksPath: string;

  /**
   * Path to a directory containing node modules.
   * @see YarnConfigCurrent.registryFolders
   */
  registryPath: string;
}

async function resolveLinks(names: string[], context: LinkResolutionContext): Promise<Link[]> {
  const candidates = await Promise.all(names.map(name => resolveLinkCandidates(name, context)));
  return candidates.flat().filter(Boolean);
}

async function resolveLinkCandidates(name: string, context: LinkResolutionContext): Promise<Link[]> {
  const {cwd, root, linksPath, registryPath} = context;
  return Promise.all([
    resolveLink(resolve(root, registryPath), name, linksPath),
    cwd !== root && resolveLink(resolve(cwd, registryPath), name, linksPath),
  ]);
}

async function resolveLink(root: string, name: string, linksPath: string): Promise<Link> {
  const path = resolve(root, name);
  const linkPath = resolve(linksPath, name);

  if (existsSync(path) && existsSync(linkPath)) {
    // resolve real paths
    const [realPath, realLinkPath] = await Promise.all([
      fse.realpath(path),
      fse.realpath(linkPath),
    ]);

    // check is symlink and points to a global link
    if (path !== realPath && realPath === realLinkPath)
      return {name, path, realPath, linkPath} as Link;
  }
}

/**
 * Delete linked packages..
 * @param cwd - current working directory.
 * @param link - linked package to remove.
 * @param dry - whether to execute in a dry run mode without deleting files.
 */
async function remove(cwd: string, link: Link, dry: boolean): Promise<void> {
  const {name, path, realPath} = link;
  console.log(
    red("-"), cyan(name),
    AR, magenta(relative(cwd, path)),
    AR, grey(relative(cwd, realPath)),
  );

  if (!dry)
    await fse.unlink(path);
}

/**
 * Scan directory for package names.
 * @param root - root directory to scan.
 * @returns names of the packages within a directory.
 */
async function scanPackageNames(root: string): Promise<string[]> {
  if (existsSync(root)) {
    const files = await fse.readdir(root);
    const scopes = files.map(async name =>
      name.startsWith("@")
        ? await scanDirectory(root, name)
        : name);

    const names = await Promise.all(scopes);
    return names.flat().filter(Boolean);
  }
  return [];
}

/**
 * Scan directory to get list of its filenames.
 * @param root - path to the root directory.
 * @param dir - path to a directory to scan relatively to the root directory.
 * @returns list of paths within directory relatively to the root directory.
 */
async function scanDirectory(root: string, dir: string): Promise<string[]> {
  const filenames = await fse.readdir(join(root, dir));
  return filenames.map(filename => join(dir, filename));
}

/** Compare links names to sort in ascending order. */
function byNameAsc(a: Link, b: Link) {
  return a.name.localeCompare(b.name);
}
