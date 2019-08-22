import { cyan, green, grey, red } from "colors";
import { ensureDir, existsSync, realpath, remove, symlink, unlink } from "fs-extra";
import { intersection } from "lodash";
import { dirname, relative, resolve } from "path";
import { CommandModule } from "yargs";
import { yarnConfigCurrent, YarnConfigCurrent, yarnList, yarnListNames } from "../..";
import { YwlProps } from "../types";

/**
 * List of parameters available to be configured by CLI.
 */
export interface LinkProps extends YwlProps {
  /**
   * Whether to search only for first-level dependencies.
   * @default false
   */
  flat?: boolean;

  /**
   * Restrict the depth of the dependencies.
   * @see https://yarnpkg.com/lang/en/docs/cli/list/#toc-yarn-list-depth-pattern
   */
  depth?: number;

  /**
   * Filter the list of dependencies by the pattern flag.
   * @see https://yarnpkg.com/lang/en/docs/cli/list/#toc-yarn-list-depth-pattern
   */
  pattern: string;

  /** Flag to remove previous symlinks. */
  clean: boolean;

  /** Set of particular links to install. */
  links: string[];
}

export const link: CommandModule<YwlProps, LinkProps> = {
  aliases: "*",
  command: "link",
  describe: "add local dependencies as workspaces",
  builder(yargs) {
    return yargs
      .option("clean", {type: "boolean"})
      .option("flat", {type: "boolean", conflicts: "depth"})
      .option("depth", {type: "number"})
      .option("pattern", {type: "string"})
      .option("links", {type: "string", array: true, conflicts: ["pattern", "depth"]})
      .middleware(args => {
        if (args.flat) args.depth = 0;
      })
      ;
  },
  async handler(props): Promise<void> {
    let {links} = props;
    const {root} = props;
    const conf = await yarnConfigCurrent();

    if (!links) {
      const list = await yarnList(props);
      const names = yarnListNames(list);
      links = intersection(names, conf.linkedModules);
    }

    // clear previous links
    if (props.clean)
      await remove(resolve(root, props.dir));

    await ensureDir(resolve(root, props.dir));
    await Promise.all(links.map(x => updateSymlink(x, conf, props)));
  },
};

const AR = grey("->");
const AL = grey("<-");

async function updateSymlink(link: string, conf: YarnConfigCurrent, props: LinkProps): Promise<void> {
  const cwd = process.cwd();
  const target = resolve(conf.linkFolder, link);
  const path = resolve(props.root, props.dir, link);

  const [a, b] = await Promise.all([
    existsSync(path) ? realpath(path) : "",
    realpath(target),
  ]);

  if (a === b) {
    console.log(grey("~"), cyan(link),
      AR, grey(relative(cwd, path)),
      AR, grey(a),
      AL, grey(target));
    return;
  }

  if (a) {
    console.log(red("-"), cyan(link),
      AR, grey(relative(cwd, a)),
      AL, grey(target));
    await unlink(path);
  } else {
    await ensureDir(dirname(path));
  }

  console.log(green("+"), cyan(link),
    AR, grey(relative(cwd, path)),
    AR, grey(relative(cwd, b)),
    AL, grey(target));

  await symlink(target, path);
}
